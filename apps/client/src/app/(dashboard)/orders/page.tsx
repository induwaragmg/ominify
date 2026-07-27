import { auth } from "@clerk/nextjs/server";
import { OrderType, ProductType } from "@repo/types";
import { CalendarDays, CheckCircle2, CircleX, Package, Receipt } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type OrderProduct = NonNullable<OrderType["products"]>[number] & {
  productId?: number;
  image?: string;
  selectedColor?: string;
  selectedSize?: string;
};

const fetchOrders = async () => {
  const { getToken } = await auth();
  const token = await getToken();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_ORDER_SERVICE_URL}/user-orders`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      // Disable caching so that users always see latest orders.
      cache: "no-store",
    },
  );

  // for failed HTTP responses.
  if (!res.ok) {
    throw new Error(`Failed to fetch orders (${res.status})`);
  }

  const data: OrderType[] = await res.json();

  if (!Array.isArray(data)) {
    throw new Error("Invalid orders response.");
  }

  return data;
};

const formatPrice = (amount: number) => `$${(amount / 100).toFixed(2)}`;

const getStatusStyles = (status: string) =>
  status === "success"
    ? "bg-green-50 text-green-700 ring-green-100"
    : "bg-red-50 text-red-700 ring-red-100";

const fetchProducts = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/products?sort=newest`,
    {
      cache: "no-store",
    },
  );

  if (!res.ok) {
    return [];
  }

  const data = await res.json();

  return Array.isArray(data) ? (data as ProductType[]) : [];
};

const getProductImage = (
  orderProduct: OrderProduct,
  product?: ProductType,
) => {
  if (orderProduct.image) {
    return orderProduct.image;
  }

  const images = product?.images as Record<string, string> | undefined;
  const selectedColor =
    orderProduct.selectedColor || product?.colors?.[0] || "";

  return images?.[selectedColor] || Object.values(images || {})[0] || "";
};

const OrdersPage = async () => {
  try {
    const [orders, products] = await Promise.all([
      fetchOrders(),
      fetchProducts(),
    ]);

    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-3xl border border-gray-100 bg-white px-6 py-8 shadow-sm">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">
                Your Orders
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Track recent purchases, payment status, and ordered products.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          {orders.length === 0 ? (
            <div className="flex min-h-60 flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-surface px-6 text-center">
              <Package className="h-10 w-10 text-gray-400" />
              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                No orders found
              </h2>
              <p className="mt-2 max-w-md text-sm text-gray-500">
                Your completed purchases will appear here once you place an
                order.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {orders.map((order) => {
                const isSuccess = order.status === "success";
                const StatusIcon = isSuccess ? CheckCircle2 : CircleX;

                return (
                  <li
                    key={order._id}
                    className="rounded-3xl border border-gray-100 bg-surface p-5"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1 space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-brand shadow-sm">
                              <Receipt className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-sm font-medium text-gray-500">
                                Order ID
                              </span>
                              <p className="truncate text-sm font-semibold text-gray-900">
                                {order._id}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ring-1 ${getStatusStyles(
                              order.status,
                            )}`}
                          >
                            <StatusIcon className="h-4 w-4" />
                            {order.status}
                          </span>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                          <div>
                            <span className="text-sm font-medium text-gray-500">
                              Total
                            </span>
                            <p className="mt-1 text-lg font-semibold text-gray-900">
                              {formatPrice(order.amount)}
                            </p>
                          </div>

                          <div>
                            <span className="text-sm font-medium text-gray-500">
                              Date
                            </span>
                            <p className="mt-1 flex items-center gap-2 text-sm text-gray-900">
                              <CalendarDays className="h-4 w-4 text-gray-400" />
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleDateString(
                                    "en-US",
                                  )
                                : "-"}
                            </p>
                          </div>

                          <div>
                            <span className="text-sm font-medium text-gray-500">
                              Items
                            </span>
                            <p className="mt-1 text-sm font-semibold text-gray-900">
                              {order.products?.length || 0}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-2xl bg-white px-4 py-3">
                          <span className="text-sm font-medium text-gray-500">
                            Products
                          </span>
                          <div className="mt-3 space-y-3">
                            {(order.products as OrderProduct[])?.map(
                              (orderProduct, index) => {
                                const matchedProduct = products.find(
                                  (product) =>
                                    product.id === orderProduct.productId ||
                                    product.name === orderProduct.name,
                                );
                                const productId =
                                  orderProduct.productId || matchedProduct?.id;
                                const imageSrc = getProductImage(
                                  orderProduct,
                                  matchedProduct,
                                );
                                const content = (
                                  <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-surface p-3 transition hover:border-brand/30 hover:bg-white">
                                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white">
                                      {imageSrc ? (
                                        <Image
                                          src={imageSrc}
                                          alt={orderProduct.name}
                                          fill
                                          sizes="64px"
                                          className="object-contain p-1"
                                        />
                                      ) : (
                                        <div className="flex h-full items-center justify-center">
                                          <Package className="h-5 w-5 text-gray-300" />
                                        </div>
                                      )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-sm font-semibold text-gray-900">
                                        {orderProduct.name}
                                      </p>
                                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                                        <span>
                                          {formatPrice(
                                            orderProduct.price || 0,
                                          )}
                                        </span>
                                        <span>
                                          Qty: {orderProduct.quantity}
                                        </span>
                                        {orderProduct.selectedSize && (
                                          <span>
                                            Size: {orderProduct.selectedSize}
                                          </span>
                                        )}
                                        {orderProduct.selectedColor && (
                                          <span>
                                            Color: {orderProduct.selectedColor}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );

                                return productId ? (
                                  <Link
                                    key={`${order._id}-${productId}-${index}`}
                                    href={`/products/${productId}`}
                                    className="block"
                                  >
                                    {content}
                                  </Link>
                                ) : (
                                  <div
                                    key={`${order._id}-${orderProduct.name}-${index}`}
                                  >
                                    {content}
                                  </div>
                                );
                              },
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    );
  } catch (error) {
    // CHANGE: Show a user-friendly error instead of crashing.
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-3xl border border-gray-100 bg-white px-6 py-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-gray-900">
            Your Orders
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Track recent purchases, payment status, and ordered products.
          </p>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex min-h-60 max-w-md flex-col items-center justify-center">
            <CircleX className="h-10 w-10 text-red-500" />
            <h2 className="mt-4 text-xl font-semibold text-gray-700">
              Failed to load your orders
            </h2>

            <p className="mt-2 text-gray-500">Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }
};

export default OrdersPage;
