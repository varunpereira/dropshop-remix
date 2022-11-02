import { json, Form, useLoaderData, useActionData, redirect } from "remix";
import productModel from "~/models/productModel";
import connectDB from "~/utils/connectDB";
import { getGlobalState, setGlobalState } from "~/utils/globalState";
import getUserByRefreshToken from "~/utils/getUserByRefreshToken";
import ProductItem from "~/components/products/item";
import orderModel from "~/models/orderModel";
import userModel from "~/models/userModel";

var process = getGlobalState("process");

export function meta() {
  return {
    title: "Public Profile",
  };
}

export async function loader({ request }: any) {
  var signedIn = await getUserByRefreshToken(request.headers.get("Cookie"));
  // if (!signedIn) {
  //   return redirect("/signin");
  // }
  connectDB();
  var searchQuery: any = new URL(request.url);
  var email: any = searchQuery.searchParams.get("email");
  var products = await productModel.find({
    email: email,
  });
  return json({ email: email, products: products });
}

export async function action({ request }: any) {
  // setup
  var signedIn = await getUserByRefreshToken(request.headers.get("Cookie"));
  if (!signedIn) {
    return redirect("/signin");
  }
  var form = await request.formData();
  connectDB();

  if (form.get("recipEmail")) {
    let email = getGlobalState("auth").user.email;
    var anothersEmail = form.get("recipEmail");
    const find = await userModel.findOne({
      email: email,
      messageEmails: [anothersEmail],
    });
    if (find === null) {
      const update1 = await userModel.updateOne(
        {
          email: email,
        },
        {
          $push: {
            messageEmails: anothersEmail,
          },
        }
      );
      const update2 = await userModel.updateOne(
        {
          email: anothersEmail,
        },
        {
          $push: {
            messageEmails: email,
          },
        }
      );
    }
    return redirect(
      "/account/messages/chats?recipEmail=" + form.get("recipEmail") + "#latest"
    );
  }

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
  var email = loaderData.email;

  return (
    <div className="text-white rounded-md">
      <div className="container  mx-auto ">
        <h1 className="text-xl font-semibold">{email + "'s Products"}</h1>
        {getGlobalState("auth").user &&
          email !== getGlobalState("auth").user.email && (
            <Form method="post">
              <input
                readOnly
                hidden
                name="recipEmail"
                value={email}
                type="text"
              />
              <button
                name="messageButton"
                type="submit"
                className="hover:text-gray-400"
              >
                Message
              </button>
            </Form>
          )}
        <div className="text-white flex flex-wrap -mx-1 lg:-mx-4">
          {products.length === 0 ? (
            <h2>No products found.</h2>
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
