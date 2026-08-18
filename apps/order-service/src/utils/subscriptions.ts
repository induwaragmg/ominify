import { consumer } from "./kafka.js"
import { createOrder } from "./order.js";

export const runKafkaSubscriptions = async () => {

    // consumer.subscribe([
    //     {
    //         topicName: "payment.successful",
    //         topicHandler: async (message) => {
    //             // console.log("Received message: payment.successful", message);
                
    //             // CHANGE 1: Extract the actual payment payload whether wrapped in message.value or sent directly.
    //             let order = message?.value ?? message;
    //             if (typeof order === "string") {
    //                 try {
    //                     order = JSON.parse(order);
    //                 } catch (e) {
    //                     // ignore parse error
    //                 }
    //             }
    //             await createOrder(order);
    //         }
    //     }
    // ]);

        consumer.subscribe([
        {
            topicName: "payment.successful",
            topicHandler: async (message) => {

                // Use message.value when the payment service sends
                // the payload wrapped inside { value: ... }; otherwise use
                // message directly for direct Kafka test messages.
                const order = message?.value ?? message;

                // Pass the extracted order payload to createOrder()
                // instead of incorrectly passing message.value directly.
                await createOrder(order);
            }
        }
    ]);
}
