import sendMail from "./utils/mailer";
import { createConsumer, createKafkaClient } from "@repo/kafka";


const kafka = createKafkaClient("email-service");
const consumer = createConsumer(kafka, "email-service");

const start = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe([
      {
        topicName: "user.created",
        topicHandler: async (message) => {
          const { email, username } = message.value;

          if (email) {
            await sendMail({
              email,
              subject: "Welcome to E-commerce App",
              text: `Welcome ${username}. You account has been created!`,
            });
          }
        },
      },
      {
        topicName: "order.created",
        topicHandler: async (message) => {
          const { email, amount, status } = message.value;

          if (email) {
            await sendMail({
              email,
              subject: "Order has been created",
              text: `Hello! Your order: Amount: ${amount/100}, Status: ${status}`,
            });
            console.log(`Email sent to ${email} for order created text ${amount/100} and status ${status}`);
          }
        },
      },
    ]);
  } catch (error) {
    console.log(error);
  }
};

start(); 


// const start = async () => {
//     try {
//       await sendMail({
//         email: "ravindu.induwara2002@gmail.com",
//         subject: "Test Email",
//         text: "This is a test email from the plutonium cooperation email service.",
//       });
//     } catch (error) {
//       console.log(error);
//     }
// }

// start();