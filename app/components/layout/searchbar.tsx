import { Form, Scripts, useLoaderData, useSubmit } from "remix";
import { SearchIcon, XIcon } from "@heroicons/react/solid";
import { useEffect, useRef, useState } from "react";

export default function component() {
  var test = "1";

  let formRef: any = useRef();
  useEffect(() => {
    // console.log("wede");
    formRef.current?.reset();
  });
  if (typeof document !== "undefined") {
    console.log("wede");
  }

  return (
    <Form
      method="get"
      // action="/searchResults"
      className="md:mr-5 relative w-full mb-1"
    >
      {/* <h1 className="text-white">{test}</h1> */}
      {/* <button type="button" onClick={handleChange}>
        click me!!
      </button> */}
      <input
        id="test"
        name="searchTerm"
        type="text"
        placeholder="search"
        className="rounded focus:shadow-outline w-full min-w-max bg-white py-2  pl-3 text-sm  text-black focus:outline-none"
      />
      <button
        ref={formRef}
        className="text-black absolute inset-y-0 right-10 w-10  max-w-min items-center justify-center  md:rounded"
        type="button"
      >
        <XIcon className="h-4 w-4" />
      </button>
      <button
        type="submit"
        className=" absolute inset-y-0 right-0 w-10  max-w-min items-center justify-center bg-white pr-2 rounded"
      >
        <SearchIcon className="h-5 w-5 text-black" />
      </button>
    </Form>
  );
}
