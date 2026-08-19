// CHANGE 1: Use .js extensions in ESM relative imports.
import sendMail from "./utils/mailer.js";
import { createConsumer, createKafkaClient } from "@repo/kafka";
import { generateOrderEmailHtml } from "./utils/orderEmailTemplate.js";

const kafka = createKafkaClient("email-service");
const consumer = createConsumer(kafka, "email-service");

const start = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe([
      {
        topicName: "user.created",
        topicHandler: async (message) => {
          // CHANGE 2: Support both value-wrapped messages and direct test payloads.
          const payload = message?.value ?? message;
          const { email, username } = payload;

          if (email) {
            await sendMail({
              email,
              subject: "Welcome to Ominify!",
              text: `Welcome ${username}! Your Ominify account has been created successfully.`,
            });
          }
        },
      },
      {
        topicName: "order.created",
        topicHandler: async (message) => {
          // CHANGE 3: Support both value-wrapped messages and direct test payloads.
          const payload = message?.value ?? message;
          const { email, amount, status, orderId, products, createdAt } = payload;

          if (email) {
            const htmlContent = generateOrderEmailHtml({
              orderId,
              email,
              amount,
              status,
              products,
              createdAt,
            });

            await sendMail({
              email,
              subject: `Thank you for your order! (Order #${orderId ? orderId.substring(orderId.length - 7).toUpperCase() : "CONFIRMED"})`,
              text: `Thank you for your order! Amount: $${(amount / 100).toFixed(2)}. Status: ${status}`,
              html: htmlContent,
            });

            console.log(`Order confirmation email sent to ${email} for order ${orderId || "new"}`);
          }
        },
      },
    ]);
  } catch (error) {
    console.error("Email service error:", error);
  }
};

start();