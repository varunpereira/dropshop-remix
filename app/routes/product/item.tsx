import {
  json,
  Form,
  useLoaderData,
  useActionData,
  redirect,
  Link,
} from "remix";
import productModel from "~/models/productModel";
import reviewModel from "~/models/reviewModel";
import connectDB from "~/utils/connectDB";
import { getGlobalState, setGlobalState } from "~/utils/globalState";
import getUserByRefreshToken from "~/utils/getUserByRefreshToken";
import orderModel from "~/models/orderModel";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MinusIcon,
  PlusIcon,
} from "@heroicons/react/solid";

var process = getGlobalState("process");

// dynamic title then use global state, no meta func
export function meta({ request }: any) {
  return {
    title: "Product",
  };
}

export async function loader({ request }: any) {
  var signedIn = await getUserByRefreshToken(request.headers.get("Cookie"));
  connectDB();
  var searchQuery: any = new URL(request.url);
  var productId: any = searchQuery.searchParams.get("productId");
  var products = await productModel.find({
    _id: productId,
  });
  var reviews = await reviewModel.find({
    productId: productId,
  });
  return json({ product: products[0], reviews: reviews });
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
  // find how to redirect to previous which would be current page after action reloads
  // or react router if easier
  return redirect("/product/item?productId=" + product._id);
}

export default function component() {
  var loaderData = useLoaderData();
  var actionData = useActionData();
  var product = loaderData.product;
  var reviews = loaderData.reviews;
  var error = "";
  if (actionData && actionData.error) {
    error = actionData.error;
  }

  return (
    <div className=" rounded-md text-white">
      {/* {JSON.stringify(product)} */}
      <div className=" items-start justify-center py-12 md:flex ">
        {product.images && (
          <div className="relative">
            <img
              className="w-full rounded-lg"
              src={product.images[0].url}
              alt={product.images[0].url}
            />
            <button className="absolute bottom-20 left-0" type="button">
              <ChevronLeftIcon className="h-10 w-10" />
            </button>
            <button className="absolute bottom-20 right-0" type="button">
              <ChevronRightIcon className="h-10 w-10" />
            </button>
          </div>
        )}
        <div className="mt-6 md:ml-6 md:mt-0 md:w-1/2 lg:ml-8 xl:w-2/5">
          <div className="border-gray-200 pb-6">
            <h1 className="text-xl font-semibold leading-7 lg:text-2xl lg:leading-6">
              {product.title}
            </h1>
          </div>
          <Link
            to={"?productId=" + product._id + "#reviews"}
            className="hover:text-gray-400 "
          >
            View Reviews
          </Link>
          <div>
            <p className="mb-5 mt-5">Description: {product.description}</p>
            <p className="">Price: ${product.price}</p>
            <p className="">Sold: {product.sold}</p>
            <p className="">In Stock: {product.stock}</p>
            <p className="">
              Seller:{" "}
              <Link
                to={"/account/profile?email=" + product.email}
                className="hover:text-gray-400"
              >
                {product.email}
              </Link>
            </p>
          </div>
          <div className="mt-5 mb-3 flex justify-start">
            <MinusIcon className="h-6 w-6" />
            <input
              className="mx-2 w-10 rounded text-center text-black"
              type="text"
            ></input>
            <PlusIcon className="h-6 w-6" />
          </div>
          <Form method="post">
            <input
              readOnly
              hidden
              name="product"
              value={JSON.stringify(product)}
              type="text"
            />
            <button className="mt-5 flex w-28  items-center justify-center rounded bg-white py-2 text-black hover:bg-gray-400">
              Add to Cart
            </button>
          </Form>

          <div className="mt-10 text-red-500">{error} </div>
        </div>
      </div>

      <div id="reviews">
        <h1 className="mb-5 mt-20 text-xl font-semibold leading-7 lg:text-2xl lg:leading-6">
          Reviews
        </h1>
        <Link
          to={"/product/addReview?productId=" + product._id}
          className="text-xl font-semibold hover:text-gray-400"
        >
          Add a Review
        </Link>
        <div className="mt-5 flex flex-wrap -mx-1 lg:-mx-4">
          {reviews.length === 0 ? (
            <h2>No Reviews</h2>
          ) : (
            reviews.map(
              (review: {
                _id: any;
                email: any;
                rating: any;
                description: any;
              }) => (
                <div
                  key={review._id}
                  className="h-40 w-40 mr-10 mb-10 max-w-sm rounded-lg border border-gray-200 bg-white p-3 shadow-md dark:border-gray-700 dark:bg-gray-800"
                >
                  <h5 className="mb-2  font-bold tracking-tight text-gray-900 dark:text-white">
                    <Link
                      to={"/account/profile?email=" + review.email}
                      className="hover:text-gray-600"
                    >
                      {review.email}
                    </Link>
                  </h5>
                  <h5 className="mb-2  font-bold tracking-tight text-gray-900 dark:text-white">
                    {" "}
                    {review.rating} / 5 stars
                  </h5>
                  <p className="mb-3 text-xs min-h-full font-normal text-gray-700 dark:text-gray-400">
                    {review.description}
                  </p>
                </div>
              )
            )
          )}
        </div>
      </div>
    </div>
  );
}
