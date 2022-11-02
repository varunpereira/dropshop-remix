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
import userModel from "~/models/userModel";
import { getSession } from "~/utils/cookieSession";

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
  var users = await userModel.find({
    email: getGlobalState("auth").user.email,
  });
  return json({ user: users[0] });
}

export async function action({ request }: any) {
  return null;
}

export default function component() {
  var loaderData = useLoaderData();
  var actionData = useLoaderData();
  var user = loaderData.user;

  return (
    <div className="bg-white text-black rounded-md">
      <h1 className="text-xl font-semibold">My Info</h1>
      {/* <p>{JSON.stringify(user)}</p> */}
      <div>
        <p>
          <b>Email:</b> {user.email}
        </p>
        <p>
          <b>Joined:</b> {user.createdAt}
        </p>
      </div>
    </div>
  );
}
