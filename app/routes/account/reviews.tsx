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
import reviewModel from "~/models/reviewModel";

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
  var reviews = await reviewModel.find({
    email: getGlobalState("auth").user.email,
  });
  return json({ reviews: reviews });
}

export async function action({ request }: any) {
  return null;
}

export default function component() {
  var loaderData = useLoaderData();
  var actionData = useLoaderData();
  var reviews = loaderData.reviews;

  return (
    <div className="bg-white text-black rounded-md">
      {/* <p>{JSON.stringify(reviews)}</p> */}
      <h1 className="text-xl font-semibold">My Reviews</h1>

      <div className="p-3">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-400">
              <tr>
                <th className="whitespace-nowrap ">
                  <div className="text-left font-semibold">Review ID</div>
                </th>
                <th className="whitespace-nowrap ">
                  <div className="text-left font-semibold">Product ID</div>
                </th>
                <th className="whitespace-nowrap ">
                  <div className="text-left font-semibold">Rating</div>
                </th>
                <th className="whitespace-nowrap ">
                  <div className="text-left font-semibold">Description</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {reviews.map((review: any) => (
                <tr key={review._id} className="my-4 text-black">
                  <td>{review._id}</td>
                  <td>{review.productId}</td>
                  <td>{review.rating}/5</td>
                  <td>{review.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
