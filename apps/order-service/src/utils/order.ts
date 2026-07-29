import { Order } from "@repo/order-db";
import { OrderType } from "@repo/types";
import { producer } from "./kafka";

export const createOrder = async (order: OrderType) => {
  const newOrder = new Order(order);

  try {
    const savedOrder = await newOrder.save();
    producer.send("order.created", {
      value: {
        orderId: savedOrder._id.toString(),
        email: savedOrder.email,
        amount: savedOrder.amount,
        status: savedOrder.status,
        products: savedOrder.products,
        createdAt: savedOrder.createdAt,
      },
    });
  } catch (error) {
    console.error("Failed to create order:", error);
    throw error;
  }
};
