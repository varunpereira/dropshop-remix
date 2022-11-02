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
import orderModel from "~/models/orderModel";

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
  var orders = await orderModel.find({
    email: getGlobalState("auth").user.email,
  });
  return json({ orders: orders });
}

export async function action({ request }: any) {
  return null;
}

export default function component() {
  var loaderData = useLoaderData();
  var actionData = useLoaderData();
  var orders = loaderData.orders;

  return (
    <div className="bg-white text-black rounded-md">
      {/* <p>{JSON.stringify(orders)}</p> */}
      <div>
        <h1 className="text-xl font-semibold">My Order History</h1>
        <br></br>
        <div className="p-3">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-400">
                <tr>
                  <th className="whitespace-nowrap ">
                    <div className="text-left font-semibold">ID</div>
                  </th>
                  <th className="whitespace-nowrap ">
                    <div className="text-left font-semibold">Qty</div>
                  </th>
                  <th className="whitespace-nowrap ">
                    <div className="text-left font-semibold">Price</div>
                  </th>
                  <th className="whitespace-nowrap ">
                    <div className="text-left font-semibold">Date</div>
                  </th>
                  <th className="whitespace-nowrap ">
                    <div className="text-left font-semibold">Refund Status</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {orders.map((order: any, index: number) => (
                  <tr key={order._id} className="my-4 text-black">
                    <td>
                      {getGlobalState("auth").user && (
                        <Link
                          to={
                            "/profile/" +
                            getGlobalState("auth").user.email +
                            "/payments/order/" +
                            order._id
                          }
                          className="hover:underline"
                        >
                          {order._id}
                        </Link>
                      )}
                    </td>
                    <td>{order.quantity}</td>
                    <td>${order.price}</td>
                    <td>{order.updatedAt}</td>
                    <td>
                      {order.refunded ? (
                        "already refunded"
                      ) : (
                        <a className="hover:underline">refund</a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
