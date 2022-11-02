import { Form, Link } from "remix";

export default function component({ product }: any) {
  return (
    <Link to={"/product/item?productId=" + product._id}>
      <div className="my-2 px-2 w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
        <div className="overflow-hidden rounded-lg bg-white text-sm hover:bg-gray-300">
          <img
            className="object-cover h-48 w-full"
            src={product.images[0].url}
            alt={product.images[0].url}
          />
          <div className="mb-5 px-5 pt-5 ">
            <h5 className="h-16 font-bold tracking-tight text-gray-900">
              {product.title}
            </h5>
            <h5 className="mb-2 font-bold tracking-tight text-gray-900">
              ${product.price}
            </h5>
            <p className="h-28 text-gray-700">{product.description}</p>
            <a>
              <Form method="post">
                <input
                  readOnly
                  hidden
                  name="product"
                  value={JSON.stringify(product)}
                  type="text"
                />
                <button className="inline-flex w-full items-center justify-center rounded-lg bg-black py-2  text-sm font-medium text-white hover:bg-gray-800 ">
                  Add to Cart
                </button>
              </Form>
            </a>
          </div>

          {/* <div className="flex items-center justify-between leading-none p-2 md:p-4">
            <a
              className="flex items-center no-underline hover:underline text-black"
              href="#"
            >
              <img
                alt="Placeholder"
                className="block rounded-full"
                src="https://picsum.photos/32/32/?random"
              />
              <p className="ml-2 text-sm">Author Name</p>
            </a>
            <a
              className="no-underline text-grey-darker hover:text-red-dark"
              href="#"
            >
              <span className="hidden">Like</span>
              <i className="fa fa-heart"></i>
            </a>
          </div> */}
        </div>
      </div>
    </Link>
  );
}
