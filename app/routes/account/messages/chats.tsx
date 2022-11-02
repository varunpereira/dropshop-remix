import { json, Form, useLoaderData, useActionData, redirect } from "remix";
import messageModel from "~/models/messageModel";
import connectDB from "~/utils/connectDB";
import { getGlobalState, setGlobalState } from "~/utils/globalState";
import getUserByRefreshToken from "~/utils/getUserByRefreshToken";
import { ArrowCircleUpIcon } from "@heroicons/react/solid";

var process = getGlobalState("process");

export function meta() {
  return {
    title: "Chat Messages",
  };
}

export async function loader({ request }: any) {
  var signedIn = await getUserByRefreshToken(request.headers.get("Cookie"));
  if (!signedIn) {
    return redirect("/signin");
  }
  connectDB();
  var searchQuery: any = new URL(request.url);
  var recipEmail: any = searchQuery.searchParams.get("recipEmail");
  var email1 = getGlobalState("auth").user.email;
  var email2 = recipEmail;
  try {
    var message1 = await messageModel.findOne({
      email1: email1,
      email2: email2,
    });
    var message2 = await messageModel.findOne({
      email1: email2,
      email2: email1,
    });
    if (message1 === null && message2 === null) {
      return json({ recipEmail: recipEmail, chats: [] });
    }
    if (message1 === null) {
      return json({ recipEmail: recipEmail, chats: message2.messages });
    }
    return json({ recipEmail: recipEmail, chats: message1.messages });
  } catch (err: any) {
    return json({ error: err.message });
  }
}

export async function action({ request }: any) {
  var form = await request.formData();
  connectDB();
  var signedIn = await getUserByRefreshToken(request.headers.get("Cookie"));
  if (!signedIn) {
    return redirect("/signin");
  }

  var email1 = getGlobalState("auth").user.email;
  var email2 = form.get("recipEmail");
  var newMessage = {
    [getGlobalState("auth").user.email]: form.get("newMessage"),
  };

  try {
    const message1 = await messageModel.findOne({
      email1: email1,
      email2: email2,
    });
    const message2 = await messageModel.findOne({
      email1: email2,
      email2: email1,
    });
    if (message1 === null && message2 === null) {
      const createMessages = await new messageModel({
        email1: email1,
        email2: email2,
      }).save();
      const updateNewMessages = await messageModel.updateOne(
        {
          email1: email1,
          email2: email2,
        },
        {
          $push: {
            messages: newMessage,
          },
        }
      );
      return redirect(
        "/account/messages/chats?recipEmail=" +
          form.get("recipEmail") +
          "#latest"
      );
    }
    if (message1 === null) {
      const updateExistingMessages = await messageModel.updateOne(
        {
          email1: email2,
          email2: email1,
        },
        {
          $push: {
            messages: newMessage,
          },
        }
      );
      return redirect(
        "/account/messages/chats?recipEmail=" +
          form.get("recipEmail") +
          "#latest"
      );
    }
    const updateExistingMessages = await messageModel.updateOne(
      {
        email1: email1,
        email2: email2,
      },
      {
        $push: {
          messages: newMessage,
        },
      }
    );
    return redirect(
      "/account/messages/chats?recipEmail=" + form.get("recipEmail") + "#latest"
    );
  } catch (error: any) {
    return redirect(
      "/account/messages/chats?recipEmail=" + form.get("recipEmail") + "#latest"
    );
  }
}

export default function component() {
  var loaderData = useLoaderData();
  var recipEmail = loaderData.recipEmail;
  var chats = loaderData.chats;

  return (
    <div className="text-white rounded-md md:px-20">
      <h1 className=" flex justify-center rounded-t-md  py-2 text-xl font-semibold">
        {recipEmail}
      </h1>

      <div className="grid h-[20rem] gap-3 overflow-auto text-white py-3">
        {chats.map((chat: any, index: number) => (
          <div key={index} className="">
            {chats.length - 1 === index ? (
              Object.keys(chat)[0] === getGlobalState("auth").user.email ? (
                <div id="latest" className="flex justify-end">
                  <div className="mr-2 max-w-max rounded-t-3xl rounded-l-3xl bg-green-600 px-3 py-1">
                    {chat[getGlobalState("auth").user.email]}
                  </div>
                </div>
              ) : (
                <div id="latest" className="flex justify-start">
                  <div className="ml-2 max-w-max rounded-t-3xl rounded-r-3xl  bg-blue-600 px-3 py-1">
                    {chat[recipEmail]}
                  </div>
                </div>
              )
            ) : Object.keys(chat)[0] === getGlobalState("auth").user.email ? (
              <div className="flex justify-end">
                <div className="mr-2 max-w-max rounded-t-3xl rounded-l-3xl bg-green-600 px-3 py-1">
                  {chat[getGlobalState("auth").user.email]}
                </div>
              </div>
            ) : (
              <div className="flex justify-start">
                <div className="ml-2 max-w-max rounded-t-3xl rounded-r-3xl  bg-blue-600 px-3 py-1">
                  {chat[recipEmail]}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Form
        method="post"
        className="relative w-full rounded-b-md border-0 mt-4"
      >
        <input
          readOnly
          hidden
          name="recipEmail"
          value={recipEmail}
          type="text"
        />
        <input
          name="newMessage"
          type="text"
          className="w-full min-w-max rounded-b-md bg-black  py-2 pl-2 text-sm leading-tight text-white"
          placeholder="type message..."
          required
        />
        <button
          className="absolute inset-y-0 right-0 w-10  max-w-min items-center justify-center rounded-b-md pr-12"
          type="submit"
        >
          <ArrowCircleUpIcon className="h-6 w-6 rounded-lg fill-green-500" />
        </button>
      </Form>
    </div>
  );
}
