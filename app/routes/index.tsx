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
import globalStyleURI from "~/styles/global.css";


var process = getGlobalState("process");


export function links() {
  return [{ rel: "stylesheet", href: globalStyleURI }];
}

export function meta() {
  return {
    title: "Home",
  };
}

export async function loader({ request }: any) {
  var signedIn = await getUserByRefreshToken(request.headers.get("Cookie"));
  // if (!signedIn) {
  //   return redirect("/signin");
  // }
  connectDB();
  // var tasks = await task.find();
  // return json({ tasks: tasks });
  return null;
}

export async function action({ request }: any) {
  var form = await request.formData();
  connectDB();
  var signedIn = await getUserByRefreshToken(request.headers.get("Cookie"));
  // if (!signedIn) {
  //   return redirect("/signin");
  // }
  // form.get("password")
  // var tasks = await task.find();
  // return json({ tasks: tasks });
  return null;
}

export default function component() {
  var loaderData = useLoaderData();
  var actionData = useLoaderData();

  return (
    <div className="bg-white text-black rounded-md">
      <img
        className="object-cover h-auto w-full"
        src={"/homeBanner.png"}
        alt={"home banner"}
      />
    </div>
  );
}
