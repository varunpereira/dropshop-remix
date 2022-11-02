import { json, Form, useLoaderData, useActionData, redirect } from "remix";
import productModel from "~/models/productModel";
import connectDB from "~/utils/connectDB";
import { getGlobalState, setGlobalState } from "~/utils/globalState";
import getUserByRefreshToken from "~/utils/getUserByRefreshToken";
import ProductItem from "~/components/products/item";
import orderModel from "~/models/orderModel";

var process = getGlobalState("process");

export function meta() {
  return {
    title: "Search Results",
  };
}

export async function loader({ request }: any) {
  await getUserByRefreshToken(request.headers.get("Cookie"));
  connectDB();
  var searchQuery: any = new URL(request.url);
  var term = searchQuery.searchParams.get("searchTerm");
  if (term === null || term.trim() === "") {
    term = "";
  }
  var products = await productModel.find({
    title: { $regex: term.trim(), $options: "i" },
  });
  return json({ products: products });
}

export async function action({ request }: any) {
  // setup
  var signedIn = await getUserByRefreshToken(request.headers.get("Cookie"));
  if (!signedIn) {
    return redirect("/signin");
  }
  var form = await request.formData();
  connectDB();

  const email = getGlobalState("auth").user.email;
  var product = JSON.parse(form.get("product"));
  const productQuantity = 1;
  // db queries
  const updateProduct = await productModel.updateOne(
    { _id: product._id },
    {
      $inc: { sold: productQuantity, stock: -productQuantity },
    }
  );
  let currentOrder = await orderModel.updateOne(
    {
      email: email,
      current: true,
      products: { $elemMatch: { productId: product._id } },
    },
    {
      $inc: {
        "products.$.productQuantity": productQuantity,
        price: product.price * productQuantity,
        quantity: productQuantity,
      },
    }
  );
  if (currentOrder.modifiedCount === 0) {
    currentOrder = await orderModel.updateOne(
      { email: email, current: true },
      {
        $push: {
          products: {
            productId: product._id,
            productQuantity: productQuantity,
            productTitle: product.title,
            productPrice: product.price,
          },
        },
        $inc: {
          price: product.price * productQuantity,
          quantity: productQuantity,
        },
      }
    );
  }
  return null;
}

export default function component() {
  var loaderData = useLoaderData();
  var products = loaderData.products;

  return (
    <div className="rounded-md">
      <div className="container  mx-auto ">
        <div className="text-white flex flex-wrap -mx-1 lg:-mx-4">
          {products.length === 0 ? (
            <h2>No Products found.</h2>
          ) : (
            products.map((product: any) => (
              <ProductItem key={product._id} product={product} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
