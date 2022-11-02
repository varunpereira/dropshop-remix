import { MinusIcon, PlusIcon, TrashIcon } from "@heroicons/react/solid";
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
import orderModel from "~/models/orderModel";
import productModel from "~/models/productModel";
import Stripe from "stripe";

var process = getGlobalState("process");

export function meta() {
  return {
    title: "home",
  };
}

export async function loader({ request }: any) {
  var signedIn = await getUserByRefreshToken(request.headers.get("Cookie"));
  if (!signedIn) {
    return redirect("/signin");
  }
  connectDB();
  const cart = await orderModel.findOne({
    email: getGlobalState("auth").user.email,
    current: true,
  });
  return json({ cart: cart });
}

var error = "";

export async function action({ request }: any) {
  // setup
  var signedIn = await getUserByRefreshToken(request.headers.get("Cookie"));
  if (!signedIn) {
    return redirect("/signin");
  }
  var form = await request.formData();
  connectDB();

  // Payment button
  if (form.get("paymentCart")) {
    // get data
    var cart = JSON.parse(form.get("paymentCart"));
    if (cart.products.length <= 0) {
      // console.log(cart.products.length);
      error = "Cart empty. Please add products.";
      return null;
      // return json({ error: "Cart empty. Please add products." });
    }
    var products = cart.products.map(
      (productItem: {
        productId: any;
        productQuantity: any;
        productTitle: any;
        productPrice: any;
      }) => {
        return {
          name: productItem.productTitle,
          description: productItem.productId,
          // images: ['https://example.com/t-shirt.png'],
          amount: productItem.productPrice * 100,
          quantity: productItem.productQuantity,
          currency: "aud",
        };
      }
    );

    // send data to server
    try {
      const stripe = new Stripe(process.env.stripeSecretKey, {
        apiVersion: "2020-08-27",
      });
      var session: any = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: products,
        success_url: `${process.env.domainURI}/cart/paymentSuccess?checkoutSessionId={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.domainURI}/cart`,
      });

      return redirect(session.url);
    } catch (error: any) {
      return json({ error: error.message });
    }
  }

  // Delete button
  const email = getGlobalState("auth").user.email;
  const { productId, productPrice, productQuantity } = JSON.parse(
    form.get("productItem")
  );
  // db queries
  const updateProduct = await productModel.updateOne(
    { _id: productId },
    {
      $inc: { sold: -productQuantity, stock: productQuantity },
    }
  );
  const currentOrder = await orderModel.updateOne(
    { email: email, current: true },
    {
      $pull: { products: { productId: productId } },
      $inc: {
        price: -productPrice * productQuantity,
        quantity: -productQuantity,
      },
    }
  );
  return null;
}

export default function component() {
  var loaderData = useLoaderData();
  var actionData: any = useLoaderData();
  var cart = loaderData.cart;

  function productsList() {
    return (
      cart.products &&
      cart.products.map((productItem: any) => (
        <div
          key={productItem.productId}
          className="-mx-8 flex items-center px-6 py-5 hover:bg-gray-100"
        >
          <div className="flex w-2/5">
            {/* <div className="w-20">
                        <img className="h-24" src="" alt="" />
                        </div> */}
            <div className="ml-4 flex flex-grow flex-col justify-between">
              <Link to={"/product/item?productId=" + productItem.productId}>
                <span className="flex hover:underline justify-start text-sm font-bold">
                  {productItem.productTitle +
                    " (" +
                    productItem.productId +
                    ")"}
                </span>
              </Link>
            </div>
          </div>
          <div className="flex justify-center items-center text-sm3 w-1/5 text-center font-semibold">
            <MinusIcon className="h-5 w-5 mr-1" />
            <span className="">{productItem.productQuantity}</span>
            <PlusIcon className="h-5 w-5 ml-1" />
          </div>
          <span className="w-1/5 text-center text-sm font-semibold">
            ${productItem.productQuantity * productItem.productPrice}
          </span>
          <Form
            method="post"
            className="w-1/5 text-center text-sm font-semibold hover:text-red-600"
          >
            <input
              readOnly
              hidden
              name="productItem"
              value={JSON.stringify(productItem)}
              type="text"
            />
            <button type="submit">
              <TrashIcon className="h-5 w-5" />
            </button>
          </Form>
        </div>
      ))
    );
  }

  return (
    <div className="bg-white text-black rounded-md">
      <div className=" my-10 shadow-md">
        <div className="rounded-lg bg-white px-10 py-10">
          <div className="flex justify-between border-b pb-8">
            <h1 className="text-xl font-semibold">Shopping Cart</h1>
            <h2 className="text-xl font-semibold">{cart.quantity} Items</h2>
          </div>
          <div className="mt-10 mb-5 flex">
            <h3 className="w-2/5 text-xs font-semibold uppercase text-gray-600">
              Product Details
            </h3>
            <h3 className="w-1/5 text-center text-center text-xs font-semibold uppercase text-gray-600">
              Quantity
            </h3>
            <h3 className="w-1/5 text-center text-center text-xs font-semibold uppercase text-gray-600">
              Total
            </h3>
            <h3 className="w-1/5 text-center text-center text-xs font-semibold uppercase text-gray-600"></h3>
          </div>

          {productsList()}
        </div>

        <div id="summary" className="px-8 py-10">
          <h1 className="border-b pb-8 text-xl font-semibold">
            Order Summary
          </h1>
          <div className="mt-10 mb-5 flex justify-between">
            <span className="text-sm font-semibold uppercase">
              Items {cart.quantity}
            </span>
            <span className="text-sm font-semibold">${cart.price}</span>
          </div>
          <div>
            <label className="mb-3 inline-block text-sm font-medium uppercase">
              Shipping
            </label>
            <select className="block w-full p-2 text-sm text-gray-600">
              <option>Standard shipping - Free</option>
            </select>
          </div>
          <div className="mt-8 border-t">
            <div className="flex justify-between py-6 text-sm font-semibold uppercase">
              <span>Total cost</span>
              <span>${cart.price}</span>
            </div>
            <Form method="post">
              <input
                readOnly
                hidden
                name="paymentCart"
                value={JSON.stringify(cart)}
              />
              <button
                type="submit"
                className="w-full rounded bg-black py-3  text-sm font-semibold uppercase text-white hover:bg-gray-600"
              >
                Proceed to Payment
              </button>
            </Form>
            <div className="mt-10 text-red-500">{error} </div>
          </div>
        </div>
      </div>
    </div>
  );
}
