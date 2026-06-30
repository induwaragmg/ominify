"use client";

import { useAuth } from '@clerk/nextjs';
import { CheckoutElementsProvider } from '@stripe/react-stripe-js/checkout';
import {loadStripe} from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { CartItemsType, ShippingFormInputs } from '@repo/types';
import CheckoutForm from './CheckoutForm';
import useCartStore from '@/stores/cartStore';
const stripe = loadStripe("pk_test_51TZTQyKAJFJWYUxKC6RcctrGNky0GabqbhbauJnzsdyxrCf8NtGerTrqW2vys3GjrjGqpPcL2GzN087zpZK1bATw00OPzRklAf");
//since this is the public key, it doenst need to put in a .env file.

const clientSecret = async (cart:CartItemsType, token: string) => {
  return fetch(
    `${process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL}/sessions/create-checkout-session`,
    { method: "POST",
      body: JSON.stringify({cart}),
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      }
     },
  )
    .then((response) => response.json())
    .then((json) => json.checkoutSessionClientSecret);
  };

const StripePaymentForm = ({shippingForm}: {shippingForm: ShippingFormInputs}) => {

  const {cart} = useCartStore();
  const [token, setToken] = useState<string | null>(null);
  const {getToken} = useAuth();

  useEffect(() => {
    getToken().then((token) => setToken(token));
  },[]);

  if(!token){ 
    return <div className=''>Loading...</div>
  }
  return (
    <CheckoutElementsProvider stripe={stripe} options={{ clientSecret: clientSecret(cart, token) }}>
      <CheckoutForm shippingForm={shippingForm} />
    </CheckoutElementsProvider>
  );
}

export default StripePaymentForm