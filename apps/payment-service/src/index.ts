import { clerkMiddleware } from "@hono/clerk-auth";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import sessionRoute from "./routes/session.route.js";
import { cors } from "hono/cors";
import stripe from "./utils/stripe.js";
import webhookRoute from "./routes/webhooks.route.js";
import { consumer, producer } from "./utils/kafka.js";
import { runKafkaSubscriptions } from "./utils/subscriptions.js";

const app = new Hono();
app.use('*', clerkMiddleware())
app.use("*", cors({origin: ["http://localhost:3002"]})) //only allow requests from the client app

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});
                                                                                                    
app.route("/sessions", sessionRoute);
app.route("/webhooks", webhookRoute);



// app.get('/test', shouldBeUser, (c) => {
//   return c.json({
//     message: "Payment service is Authenticated!",
//     userId: c.get("userId"),  //userId to send to payment provider
//   });
// });

// app.get('/app', shouldBeUser, async (c) => {
//   const { products } = await c.req.json();

//   const totalPrice = await Promise.all(
//     products.map( async (product: any) => {
//       const productInDb : any = await fetch(`localhost:8000/products/${product.id}`);
//       return productInDb.price * product.quantity;
//     })
//   );
// });

// app.post("/create-stripe-product", async (c) => {
//   const res = await stripe.products.create({
//     id: "1",
//     name:"Adidas coreFit T-Shirt",
//     default_price_data: {
//       currency: "usd",
//       unit_amount: 69 * 100,
//     }
//   })

//   return c.json(res); 
// })

// app.get("/stripe-product-price", async (c) => {
//   const res = await stripe.products.create({
//     id: "124",
//     name:"test product",
//     default_price_data: {
//       currency: "usd",
//       unit_amount: 10 * 100,
//     }
//   })
 
//   return c.json(res); 
// }) 

const start = async () => {
  try {
    Promise.all([await producer.connect(), await consumer.connect()]);
    await runKafkaSubscriptions();
    serve(
      {
        fetch: app.fetch,
        port: 8002,
      },
      (info) => {
        console.log("Payment service is running on port 8002");
      },
    );
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};


start();