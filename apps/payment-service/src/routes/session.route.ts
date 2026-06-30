import { Hono } from "hono";
import stripe from "../utils/stripe";
import { shouldBeUser } from "../middleware/authMiddleware";

const sessionRoute = new Hono()

sessionRoute.post('/create-checkout-session', shouldBeUser, async (c) => {
  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'elements',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'T-shirt',
            },
            unit_amount: 2000,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      return_url: 'https://localhost:3002/return?session_id={CHECKOUT_SESSION_ID}',
    }); 

    return c.json({checkoutSessionClientSecret: session.client_secret});
  }
  catch (error) {
    console.error(error);
    return c.json( { error : 'Failed to create checkout session' });
  }
});



export default sessionRoute;

