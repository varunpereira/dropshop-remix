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

var process = getGlobalState("process");

// dynamic title then use global state, no meta func
export function meta({ request }: any) {
  return {
    title: "Add Review",
  };
}

export async function loader({ request }: any) {
  var signedIn = await getUserByRefreshToken(request.headers.get("Cookie"));
  if (!signedIn) {
    return redirect("/signin");
  }
  connectDB();
  var searchQuery: any = new URL(request.url);
  var productId: any = searchQuery.searchParams.get("productId");
  var products = await productModel.find({
    _id: productId,
  });
  return json({ product: products[0] });
}

export async function action({ request }: any) {
  var form = await request.formData();
  connectDB();
  var searchQuery: any = new URL(request.url);
  var productId: any = searchQuery.searchParams.get("productId");

  // validation
  if (form.get("rating") === "select") {
    return json({ error: "Please select a rating." });
  }
  if (form.get("description").trim().length === 0) {
    return json({ error: "Description required." });
  }

  var signedIn = await getUserByRefreshToken(request.headers.get("Cookie"));
  if (!signedIn) {
    return redirect("/signin");
  }

  const save = await new reviewModel({
    productId: productId,
    email: getGlobalState("auth").user.email,
    rating: form.get("rating"),
    description: form.get("description"),
  }).save();

  return redirect("/product/item?productId=" + productId);
}

export default function component() {
  var loaderData = useLoaderData();
  var product = loaderData.product;
  var actionData: any = useActionData();
  var error = "";
  if (actionData && actionData.error) {
    error = actionData.error;
    console.log(error);
  }

  return (
    <div className=" rounded-md text-white">
      {/* {JSON.stringify(product)} */}
      <div className="container mx-auto flex-1 flex-col items-center justify-center ">
        <Form
          method="post"
          action={"/product/addReview?productId=" + product._id}
          className="w-full rounded bg-white  px-20 py-8 text-black shadow-md"
        >
          <h1 className="mb-8 text-center text-xl">
            Add a Review for {product.title}
          </h1>
          <p>Rating (out of 5)</p>
          <select name="rating">
            <option hidden value="select">
              select
            </option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
          <p>Description</p>
          <input
            name="description"
            type="text"
            className="border-grey-light mb-4 w-full rounded border p-3"
            required
          />
          <button
            type="submit"
            className="hover:bg-green-dark my-1 w-full rounded bg-black py-3 text-center text-white focus:outline-none"
          >
            Add
          </button>
          <div className="mt-10 text-red-500">{error}</div>
        </Form>
      </div>
    </div>
  );
}
