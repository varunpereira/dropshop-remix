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
import orderModel from "~/models/orderModel";

var process = getGlobalState("process");

export function meta() {
  return {
    title: "Sign up",
  };
}

export async function loader({ request }: any) {
  await getUserByRefreshToken(request.headers.get("Cookie"));
  return null;
}

export async function action({ params, request }: any) {
  try {
    // setup
    var form = await request.formData();
    connectDB();

    // signup validation
    var user = await userModel.findOne({ email: form.get("email") });
    if (user !== null) {
      return json({ error: "This user email already exists." });
    }
    if (form.get("password") !== form.get("confirmPassword")) {
      return json({ error: "Password and Confirm Password don't match." });
    }

    // finally save new user
    const passwordHash = bcryptjs.hashSync(form.get("password"), 12);
    const save = await new userModel({
      email: form.get("email"),
      fullName: form.get("fullName"),
      password: passwordHash,
      role: "individual",
    }).save();

    // create cart data
    var createCart = await new orderModel({
      email: form.get("email"),
      current: true,
    }).save();

    // sign in without validation
    var accessToken: any = jwt.sign(
      { id: form.get("email") },
      process.env.accessTokenSecret,
      { expiresIn: "15m" }
    );
    setGlobalState("auth", {
      accessToken: accessToken,
      user: {
        email: form.get("password"),
        role: "individual",
      },
      cartQuantity: 0,
    });
    var refreshToken = jwt.sign(
      { id: form.get("email") },
      process.env.refreshTokenSecret,
      { expiresIn: "7d" }
    );
    var session = await getSession(request.headers.get("Cookie"));
    // have as many cookies as you want, do more .set
    session.set("refreshToken", refreshToken);

    // Login succeeded, send them to the home page.
    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (error: any) {
    return json({ error: "Error. Please try again later." });
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
          <h1 className="mb-8 text-center text-3xl">Sign up</h1>
          <Form method="post">
            <input
              name="fullName"
              type="text"
              className="border-grey-light mb-4 block w-full rounded border p-3"
              placeholder="Full Name"
              required
            />
            <input
              name="email"
              type="text"
              className="border-grey-light mb-4 block w-full rounded border p-3"
              placeholder="Email"
              required
            />
            <input
              name="password"
              type="password"
              className="border-grey-light mb-4 block w-full rounded border p-3"
              placeholder="Password"
            />
            <input
              name="confirmPassword"
              type="password"
              className="border-grey-light mb-4 block w-full rounded border p-3"
              placeholder="Confirm Password"
              required
            />
            <button
              type="submit"
              className="hover:bg-green-dark my-1 w-full rounded bg-black py-3 text-center text-white focus:outline-none"
            >
              Sign up
            </button>
          </Form>
          <div className="mt-10 text-red-500">{error} </div>
        </div>

        <div className="text-white mt-6">
          {"Already have an account? "}
          <Link
            to="/signin"
            className="border-blue text-blue border-b no-underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
