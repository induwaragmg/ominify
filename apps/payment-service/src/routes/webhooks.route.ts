import { Hono } from "hono";
import Stripe from "stripe";
import stripe from "../utils/stripe";
import { producer } from "../utils/kafka";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
const webhookRoute = new Hono();

webhookRoute.post("/stripe", async (c) => {
    const body = await c.req.text();
    const sig = c.req.header("stripe-signature");

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
    } catch (error) {
        console.log("webhook verification failed");
        return c.json({ error: "Webhook verification failed" }, 400);
    }

    switch (event.type) {
        case "checkout.session.completed":
            const session = event.data.object as Stripe.Checkout.Session;
            const lineItems = await stripe.checkout.sessions.listLineItems(
                session.id,
                {
                    expand: ["data.price.product"],
                }
            );

            // TODO: create order
            console.log("#######################################\n webhook received", session, "\n##################################");
            producer.send("payment.successful", {
                value: {
                    userId: session.client_reference_id,
                    email: session.customer_details?.email,
                    amount: session.amount_total,
                    status: session.payment_status === "paid" ? "success" : "failed",
                    products: lineItems.data.map((item) => {
                        const stripeProduct = item.price?.product as
                            | Stripe.Product
                            | string
                            | null;
                        const metadata =
                            typeof stripeProduct === "object" && stripeProduct
                                ? stripeProduct.metadata
                                : {};

                        return {
                            productId: metadata.productId
                                ? Number(metadata.productId)
                                : undefined,
                            name: item.description,
                            quantity: item.quantity,
                            price: item.price?.unit_amount,
                            image: metadata.image,
                            selectedColor: metadata.selectedColor,
                            selectedSize: metadata.selectedSize,
                        };
                    }),
                    //shipping address
                }
            })

            break;
 
        default:
            break;
    }
    return c.json({ received: true });
});

export default webhookRoute; 
