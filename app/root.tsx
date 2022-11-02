import {
  LiveReload,
  Outlet,
  redirect,
  Meta,
  Links,
  Scripts,
  ScrollRestoration,
} from "remix";
import { getGlobalState, setGlobalState } from "~/utils/globalState";
import { getSession, commitSession } from "~/utils/cookieSession";
import globalStyleURI from "~/styles/global.css";
import { destroySession } from "~/utils/cookieSession";
import Navbar from "~/components/layout/navbar";
import Footer from "~/components/layout/footer";

export function meta() {
  return {
    title: "dropshop",
    description: "A description for the route",
    keywords: "remix, javascript, react",
  };
}

export function links() {
  return [{ rel: "stylesheet", href: globalStyleURI }];
}

export async function action({ params, request }: any) {
  var session = await getSession(request.headers.get("Cookie"));
  setGlobalState("auth", {});
  return redirect("/signin", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

export default function Document() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="description" content="ecom web app"></meta>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="icon" href="/favicon.gif" />
        <link
          href="//maxcdn.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.min.css"
          rel="stylesheet"
        ></link>
        <Meta />
        <Links />
      </head>
      <body className="bg-black px-10 min-w-fit">
        <Navbar />
        <Outlet />
        <Footer />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
