import { createCookieSessionStorage } from "remix";
import { getGlobalState, setGlobalState } from "~/utils/globalState";

var process = getGlobalState("process");
var cookieSessionSecret = process.env.cookieSessionSecret;

export var { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: "__session",
      // default 1 min expiry so match with access token expiry 15min
      expires: new Date(Date.now() + 60000 * 15),
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      secrets: [cookieSessionSecret],
    },
  });
