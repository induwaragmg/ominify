import { auth } from "@clerk/nextjs/server";
import { OrderType } from "@repo/types";

const fetchOrders = async () => {
  const { getToken } = await auth();
  const token = await getToken();

  const res = await fetch(`${process.env.NEXT_PUBLIC_ORDER_SERVICE_URL}/user-orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    // Disable caching so that users always see latest orders.
      cache: "no-store",
  });
  // for failed HTTP responses.
  if (!res.ok) {
    throw new Error(`Failed to fetch orders (${res.status})`);
  }
  
  const data: OrderType[] = await res.json();

  if (!Array.isArray(data)) {
    throw new Error("Invalid orders response.");
  }

  return data;
}

const OrdersPage = async () => {
  try {
  const orders = await fetchOrders();

  if (!orders) {
    return <div className="">No orders found!</div>;
  }

  return (
  <div className="">
    <h1 className="text-2xl my-4 font-medium">Your Orders</h1>
    <ul>
      {orders.map((order) => (
        <li key={order._id} className="flex items-center mb-4">
          <div className="w-1/4">
            <span className="font-medium text-sm text-gray-500">
              Order ID
            </span>
            <p>{order._id}</p>
          </div>
          <div className="w-1/12">
            <span className="font-medium text-sm text-gray-500">Total</span>
            <p>{order.amount / 100}</p>
          </div>
          <div className="w-1/12">
            <span className="font-medium text-sm text-gray-500">Status</span>
            <p>{order.status}</p>
          </div>
          <div className="w-1/8">
            <span className="font-medium text-sm text-gray-500">Date</span>
            <p>
              {order.createdAt
                ? new Date(order.createdAt).toLocaleDateString("en-US")
                : "-"}
            </p>
          </div>
          <div className="">
            <span className="font-medium text-sm text-gray-500">
              Products
            </span>
            <p>{order.products?.map(product=> product.name).join(", ") || "-"}</p>
          </div>
          
        </li>
      ))}
    </ul>
  </div>
);
} catch (error) {
    // CHANGE: Show a user-friendly error instead of crashing.
    return (
      <div className="py-10 text-center mx-auto">
        <h2 className="text-xl font-semibold text-gray-700">
          Failed to load your orders
        </h2>

        <p className="mt-2 text-gray-500">
          Please try again later.
        </p>
      </div>
    );
  }
}

export default OrdersPage