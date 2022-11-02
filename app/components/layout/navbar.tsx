import {
  MenuIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  ChevronDownIcon,
} from "@heroicons/react/solid";
import { Form, Link } from "remix";
import { getGlobalState } from "~/utils/globalState";
import Searchbar from "~/components/layout/searchbar";

export default function component() {
  function test(e: any) {
    e.preventDefault();
    console.log("s");
  }

  function signedInComponent() {
    return (
      <>
        <li className="nav-item mr-5">
          <Link
            to="/product/sell"
            className="block py-2 text-white no-underline hover:text-gray-400 "
          >
            Sell
          </Link>
        </li>
        <li className="nav-item mr-3">
          <Link
            to={"/cart"}
            className="block flex py-2 text-white no-underline hover:text-gray-400"
          >
            <ShoppingCartIcon className="h-5 w-5" />
            <sup className="justify-end font-bold">
              {getGlobalState("auth").user &&
                getGlobalState("auth").cartQuantity}
            </sup>
          </Link>
        </li>

        <div className="nav-item flow-root">
          <div className="rounded text-white md:mx-2">
            {getGlobalState("auth").user && (
              <div className="relative">
                <div className=" pl-1 pr-3 min-w-full  rounded items-center hover:text-gray-400">
                  <label
                    htmlFor="showMore"
                    className=" cursor-pointer transition-all flex items-center mb-1"
                  >
                    {getGlobalState("auth").user.email}
                    <ChevronDownIcon className="h-5 w-5 " />
                  </label>
                </div>

                <input
                  type="checkbox"
                  name="showMore"
                  id="showMore"
                  className="hidden peer"
                />

                <div className=" bg-black pb-1 hidden peer-checked:flex absolute rounded flex-col w-full">
                  <Link
                    to={
                      "/account/profile?email=" +
                      getGlobalState("auth").user.email
                    }
                    className=" pl-1 pt-1  hover:text-gray-400"
                  >
                    Profile
                  </Link>
                  <Link
                    to={"/account/messages"}
                    className=" pl-1 pt-1   hover:text-gray-400"
                  >
                    Messages
                  </Link>
                  <Link
                    to={"/account/info"}
                    className=" pl-1 pt-1   hover:text-gray-400"
                  >
                    Info
                  </Link>
                  <Link
                    to={"/account/payments"}
                    className=" pl-1 pt-1   hover:text-gray-400"
                  >
                    Payments
                  </Link>
                  <Link
                    to={"/account/sales"}
                    className=" pl-1 pt-1   hover:text-gray-400"
                  >
                    Sales
                  </Link>
                  <Link
                    to={"/account/reviews"}
                    className=" pl-1 pt-1   hover:text-gray-400"
                  >
                    Reviews
                  </Link>
                  <Form method="post">
                    <button
                      name="signOut"
                      type="submit"
                      className="pl-1 pt-1 hover:text-gray-400"
                    >
                      Sign Out
                    </button>
                  </Form>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <nav className="mb-10 bg-black py-4 text-white  md:flex md:items-center md:justify-between ">
      <label htmlFor="mobileMenu" className="flex justify-between">
        <Link to="/" className="mr-5 text-md text-white pb-1">
          <span className="font-serif font-semibold text-xl flex justify-between  no-underline hover:text-gray-400">
            <ShoppingBagIcon className="h-7 w-7 " />
            dropshop
          </span>
        </Link>
        <MenuIcon className="cursor-pointer h-8 w-8 hover:text-gray-400 text-white md:hidden " />
      </label>
      <input id="mobileMenu" type="checkbox" className="peer hidden" />
      <div className="peer-checked:flex hidden">
        <ul className="p-2 list-reset md:flex md:items-center absolute bg-black rounded w-full"></ul>
      </div>

      <Searchbar />
      <ul className=" list-reset md:flex md:items-center">
        {getGlobalState("auth").user ? (
          signedInComponent()
        ) : (
          <li className="nav-item">
            <Link to="/signin" className="hover:text-gray-400">
              <span className="mr-1">Sign</span>in
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
