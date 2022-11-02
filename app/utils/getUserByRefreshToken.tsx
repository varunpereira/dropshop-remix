import { getGlobalState, setGlobalState } from "~/utils/globalState";
import { getSession, commitSession } from "~/utils/cookieSession";
import { json, Form, useLoaderData, useActionData, redirect } from "remix";
import jwt from "jsonwebtoken";
import userModel from "~/models/userModel";
import orderModel from "~/models/orderModel";

var process = getGlobalState("process");

export default async function getUserByRefreshToken(reqSession: any) {
  var session = await getSession(reqSession);
  // if logged in
  if (session.has("refreshToken")) {
    var result: any = jwt.verify(
      session.get("refreshToken"),
      process.env.refreshTokenSecret
    );
    if (!result) {
      // expired refresh token
      return redirect("/signin");
    }
    var users = await userModel.find({ email: result.id });
    if (users[0] === null) {
      // user not found
      return redirect("/signin");
    }
    var accessToken: any = jwt.sign(
      { id: users[0].email },
      process.env.accessTokenSecret,
      { expiresIn: "15m" }
    );
    const currentOrder = await orderModel.findOne({
      email: result.id,
      current: true,
    });
    setGlobalState("auth", {
      accessToken: accessToken,
      user: users[0],
      cartQuantity: currentOrder.quantity,
    });
    // console.log(getGlobalState("auth"))
    return true;
  }
  return false;
}
