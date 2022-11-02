import { BriefcaseIcon, PlusCircleIcon } from "@heroicons/react/solid";
import {
  json,
  Form,
  useLoaderData,
  useActionData,
  redirect,
  Link,
} from "remix";
import task from "~/models/taskModel";
import connectDB from "~/utils/connectDB";
import { getGlobalState, setGlobalState } from "~/utils/globalState";
import getUserByRefreshToken from "~/utils/getUserByRefreshToken";
import { getSession, commitSession } from "~/utils/cookieSession";
import productModel from "~/models/productModel";

var process = getGlobalState("process");

export function meta() {
  return {
    title: "Sell",
  };
}

export async function loader({ request }: any) {
  var signedIn = await getUserByRefreshToken(request.headers.get("Cookie"));
  if (!signedIn) {
    return redirect("/signin");
  }
  console.log("sell loader " + getGlobalState("auth").user.email);

  connectDB();
  // var tasks = await task.find();
  // return json({ tasks: tasks });
  return null;
}

export async function action({ request }: any) {
  var form = await request.formData();
  connectDB();
  var signedIn = await getUserByRefreshToken(request.headers.get("Cookie"));
  if (!signedIn) {
    return redirect("/signin");
  }

  // validation
  if (form.get("stock") === "select") {
    return json({ error: "Please select a rating." });
  }

  const save = await new productModel({
    email: getGlobalState("auth").user.email,
    title: form.get("title"),
    description: form.get("description"),
    category: form.get("category"),
    stock: form.get("stock"),
    price: form.get("price"),
    images: [
      {
        public_id: "nextjs_media/irfwxjz56x4xa6pdwoks",
        url: "https://res.cloudinary.com/demo/image/upload/sheep.jpg",
      },
    ],
  }).save();

  return redirect("/");
}

export default function component() {
  var loaderData = useLoaderData();
  var actionData: any = useActionData();
  var error = "";
  if (actionData && actionData.error) {
    error = actionData.error;
    console.log(error);
  }

  return (
    <div className="bg-grey-lighter flex flex-col">
      <div className="container mx-auto flex max-w-sm flex-1 flex-col items-center justify-center px-2">
        <div className="w-full rounded bg-white px-6 py-8 text-black shadow-md">
          <h1 className="mb-8 text-center text-3xl">Sell a Product</h1>
          <Form method="post">
            <h1>Title: </h1>
            <input
              name="title"
              type="text"
              className="border-grey-light mb-4 block w-full rounded border p-3"
            />
            <h1>Description: </h1>
            <input
              name="description"
              type="text"
              className="border-grey-light mb-4 block w-full rounded border p-3"
            />
            <h1>Category: </h1>
            <input
              name="category"
              type="text"
              className="border-grey-light mb-4 block w-full rounded border p-3"
            />
            <h1>Stock: </h1>
            <input
              name="stock"
              type="text"
              className="border-grey-light mb-4 block w-full rounded border p-3"
            />
            <h1>Price: </h1>
            <input
              name="price"
              type="text"
              className="border-grey-light mb-4 block w-full rounded border p-3"
            />
            <h1>Images:</h1>
            <button
              type="submit"
              className="hover:bg-green-dark my-1 w-full rounded bg-black py-3 text-center text-white focus:outline-none"
            >
              Sell
            </button>
          </Form>
          <div className="mt-10 text-red-500">{error} </div>
        </div>
      </div>
    </div>
  );
}
