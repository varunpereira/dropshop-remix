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
  return json({ messageEmails: users[0].messageEmails });
}

export async function action({ request }: any) {
  return null;
}

export default function component() {
  var loaderData = useLoaderData();
  var actionData = useLoaderData();
  var messageEmails = loaderData.messageEmails;

  return (
    <div className="bg-white text-black rounded-md">
      <div className="rounded-lg bg-white pb-2 pl-2 text-black">
        <h1 className="mb-5 pt-4 pl-2 text-xl font-semibold ">My Messages</h1>
        {messageEmails.map((recipEmail: any) => (
          <Link to={"/account/messages/chats?recipEmail=" + recipEmail + "#latest"}>
            <div className="mx-2 mb-2 rounded-md border-2 border-gray-600 hover:bg-gray-200">
              {recipEmail}
            </div>
          </Link>
        ))}

      </div>
    </div>
  );
}
