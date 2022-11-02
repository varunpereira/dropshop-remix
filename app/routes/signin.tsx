import { useEffect, useState } from "react";
import { getGlobalState, setGlobalState } from "~/utils/globalState";
import {
  json,
  Form,
  useLoaderData,
  redirect,
  Link,
  useActionData,
} from "remix";
import connectDB from "~/utils/connectDB";
import Cookie from "js-cookie";
import userModel from "~/models/userModel";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { getSession, commitSession } from "~/utils/cookieSession";
import getUserByRefreshToken from "~/utils/getUserByRefreshToken";

var process = getGlobalState("process");

export function meta() {
  return {
    title: "sign in",
  };
}

export async function loader({ request }: any) {
  await getUserByRefreshToken(request.headers.get("Cookie"));
  return null;
}

export async function action({ params, request }: any) {
  try {
    var form = await request.formData();
    connectDB();

    var user = await userModel.findOne({ email: form.get("email") });
    if (user === null) {
      return json({ error: "This user does not exist." });
    }
    var isMatch = bcryptjs.compareSync(form.get("password"), user.password);
    if (!isMatch) {
      return json({ error: "Incorrect password." });
    }

    var accessToken: any = jwt.sign(
      { id: user.email },
      process.env.accessTokenSecret,
      { expiresIn: "15m" }
    );
    setGlobalState("auth", {
      accessToken: accessToken,
      user: {
        email: user.email,
        role: user.role,
      },
      cartQuantity: 0,
    });
    var refreshToken = jwt.sign(
      { id: user.email },
      process.env.refreshTokenSecret,
      { expiresIn: "7d" }
    );
    var session = await getSession(request.headers.get("Cookie"));
    // have as many cookies as you want, do more .set
    session.set("refreshToken", refreshToken);
    // console.log("signin " + session.get("refreshToken"));

    // Login succeeded, send them to the home page.
    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (error: any) {
    return json({ ok: false });
  }
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
          <h1 className="mb-8 text-center text-3xl">Sign in</h1>
          <Form method="post">
            <input
              name="email"
              type="text"
              className="border-grey-light mb-4 block w-full rounded border p-3"
              placeholder="Email"
            />
            <input
              name="password"
              type="password"
              className="border-grey-light mb-4 block w-full rounded border p-3"
              placeholder="Password"
            />
            <button
              type="submit"
              className="hover:bg-green-dark my-1 w-full rounded bg-black py-3 text-center text-white focus:outline-none"
            >
              Sign in
            </button>
          </Form>
          <div className="mt-10 text-red-500">{error} </div>
        </div>

        <div className="text-white mt-6">
          {"Don't have an account? "}
          <Link
            to="/signup"
            className="border-blue text-blue border-b no-underline"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
