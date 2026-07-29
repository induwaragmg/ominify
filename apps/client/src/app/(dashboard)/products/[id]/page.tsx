import ProductInteraction from "@/components/ProductInteraction";
import { ProductType } from "@repo/types";
import Image from "next/image";

const fetchProduct = async (id: string): Promise<ProductType> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/products/${id}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch product (${res.status})`);
  }

  const data = await res.json();

  if (
    !data ||
    typeof data !== "object" ||
    !Array.isArray(data.sizes) ||
    !Array.isArray(data.colors)
  ) {
    throw new Error("Invalid product response.");
  }

  return data as ProductType;
};

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  try {
    const product = await fetchProduct(id);

    return {
      title: product.name,
      description: product.description,
    };
  } catch {
    return {
      title: "Product unavailable",
      description: "We couldn't load this product.",
    };
  }
};

const ProductPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ color: string; size: string }>;
}) : Promise<React.ReactNode> => {
  try {
    const { size, color } = await searchParams;
    const { id } = await params;
    const product = await fetchProduct(id);

    const selectedSize = product.sizes.includes(size)
      ? size
      : (product.sizes[0] as string);
    const selectedColor = product.colors.includes(color)
      ? color
      : (product.colors[0] as string);
    const imageSrc = (product.images as Record<string, string>)?.[
      selectedColor
    ];

    return (
      <div className="px-4 sm:px-6 md:px-8 grid gap-8 py-6 lg:grid-cols-12 lg:gap-12 lg:py-12">
        {/* IMAGE */}
        <div className="relative aspect-square overflow-hidden rounded-lg border border-gray-100 bg-gray-50 lg:col-span-5 lg:aspect-[4/5]">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="object-contain p-4"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-gray-400">
              Product image unavailable
            </div>
          )}
        </div>

        {/* DETAILS */}
        <div className="flex flex-col gap-5 lg:col-span-7">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase text-gray-400">
              {product.categorySlug}
            </p>
            <h1 className="text-2xl font-semibold text-gray-900 md:text-3xl">
              {product.name}
            </h1>
            <p className="max-w-2xl leading-7 text-gray-500">
              {product.description}
            </p>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900">
            ${product.price.toFixed(2)}
          </h2>

          <ProductInteraction
            product={product}
            selectedSize={selectedSize}
            selectedColor={selectedColor}
          />

          {/* CARD INFO */}
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-5">
            <Image
              src="/klarna.png"
              alt="klarna"
              width={50}
              height={25}
              className="rounded-md"
            />
            <Image
              src="/cards.png"
              alt="cards"
              width={50}
              height={25}
              className="rounded-md"
            />
            <Image
              src="/stripe.png"
              alt="stripe"
              width={50}
              height={25}
              className="rounded-md"
            />
          </div>

          <p className="max-w-2xl text-xs leading-5 text-gray-500">
            By clicking Pay Now, you agree to our{" "}
            <span className="underline hover:text-black">Terms & Conditions</span>{" "}
            and <span className="underline hover:text-black">Privacy Policy</span>
            . You authorize us to charge your selected payment method for the
            total amount shown. All sales are subject to our return and{" "}
            <span className="underline hover:text-black">Refund Policies</span>.
          </p>
        </div>
      </div>
    );
  } catch (error) {
    console.error(error);

    return (
      <div className="py-10 text-center mx-auto">
        <h2 className="text-xl font-semibold text-gray-700">
          Failed to load this product
        </h2>

        <p className="mt-2 text-gray-500">Please try again later.</p>
      </div>
    );
  }
};

export default ProductPage;
