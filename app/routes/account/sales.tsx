import { BriefcaseIcon, PlusCircleIcon } from "@heroicons/react/solid";
import {
  json,
  Form,
  useLoaderData,
  useActionData,
  redirect,
  Link,
} from "remix";
import connectDB from "~/utils/connectDB";
import { getGlobalState, setGlobalState } from "~/utils/globalState";
import getUserByRefreshToken from "~/utils/getUserByRefreshToken";
import productModel from "~/models/productModel";

var process = getGlobalState("process");

export function meta() {
  return {
    title: "Account Info",
  };
}

export async function loader({ request }: any) {
  var signedIn = await getUserByRefreshToken(request.headers.get("Cookie"));
  if (!signedIn) {
    return redirect("/signin");
  }
  connectDB();
  var products = await productModel.find({
    email: getGlobalState("auth").user.email,
  });
  return json({ products: products });
}

export async function action({ request }: any) {
  return null;
}

export default function component() {
  var loaderData = useLoaderData();
  var actionData = useLoaderData();
  var products = loaderData.products;

  return (
    <div className="bg-white text-black rounded-md">
      {/* <p>{JSON.stringify(products)}</p> */}
      <h1 className="text-xl font-semibold">Your Products</h1>

      <div className="p-3">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-400">
              <tr>
                <th className="whitespace-nowrap ">
                  <div className="text-left font-semibold">ID</div>
                </th>
                <th className="whitespace-nowrap ">
                  <div className="text-left font-semibold">Title</div>
                </th>
                <th className="whitespace-nowrap ">
                  <div className="text-left font-semibold">Description</div>
                </th>
                <th className="whitespace-nowrap ">
                  <div className="text-left font-semibold">Category</div>
                </th>
                <th className="whitespace-nowrap ">
                  <div className="text-left font-semibold">Price</div>
                </th>
                <th className="whitespace-nowrap ">
                  <div className="text-left font-semibold">Sold</div>
                </th>
                <th className="whitespace-nowrap ">
                  <div className="text-left font-semibold">Stock</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {products.map((product: any) => (
                <tr key={product._id} className="my-4 text-black">
                  <td>{product._id}</td>
                  <td> {product.title}</td>
                  <td>{product.description}</td>
                  <td>{product.category}</td>
                  <td>${product.price}</td>
                  <td>{product.sold}</td>
                  <td> {product.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
