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
import orderModel from "~/models/orderModel";
import Stripe from "stripe";

var process = getGlobalState("process");

export function meta() {
  return {
    title: "home",
  };
}

export async function loader({ request }: any) {
  var signedIn = await getUserByRefreshToken(request.headers.get("Cookie"));
  if (!signedIn) {
    return redirect("/signin");
  }
  connectDB();

  var searchQuery: any = new URL(request.url);
  var checkoutSessionId: any =
    searchQuery.searchParams.get("checkoutSessionId");

  // check if alrdy  cart paid
  const cartPaid = await orderModel.findOne({
    email: getGlobalState("auth").user.email,
    current: false,
    checkoutSessionId: checkoutSessionId,
  });
  if (cartPaid === null) {
    // update cart to paid + add csId
    const cartPay = await orderModel.updateOne(
      { email: getGlobalState("auth").user.email, current: true },
      {
        current: false,
        checkoutSessionId: checkoutSessionId,
      }
    );
    // create new cart
    var cartNew = await new orderModel({
      email: getGlobalState("auth").user.email,
      current: true,
    }).save();
    // update global state cart quantity
    await getUserByRefreshToken(request.headers.get("Cookie"));
    return null;
  }
  return json({ error: "Link expired." });
}

export async function action({ request }: any) {
  var form = await request.formData();
  connectDB();
  var signedIn = await getUserByRefreshToken(request.headers.get("Cookie"));
  if (!signedIn) {
    return redirect("/signin");
  }

  return null;
}

export default function component() {
  var loaderData = useLoaderData();
  var actionData = useLoaderData();
  var error = null;
  if (actionData && actionData.error) {
    error = actionData.error;
  }

  return (
    <div className="bg-white text-black rounded-md">
      {!error ? (
        <h1>Payment Success - check your email.</h1>
      ) : (
        <div className="mt-10 text-red-500">{error} </div>
      )}
    </div>
  );
}
