"use client"

import { ShippingFormInputs } from "@repo/types"
import { PaymentElement, useCheckoutElements } from "@stripe/react-stripe-js/checkout"
import { useState } from "react";

const CheckoutForm = ({shippingForm}: {shippingForm: ShippingFormInputs}) => {

  const checkoutState = useCheckoutElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<String | null>(null);

  if (checkoutState.type === 'loading') {
    return (
      <div>Loading...</div>
    );
  }

  if (checkoutState.type === 'error') {
    return (
      <div>Error: {checkoutState.error.message}</div>
    );
  }

  const checkout = checkoutState.checkout;

  

  const handleClick = async () => {
    setLoading(true);
    
    await checkout.updateEmail(shippingForm.email);

    await checkout.updateShippingAddress({
        name: "shipping_address",
        address: {
            line1: shippingForm.address,
            city: shippingForm.city,   
            country: "US", // Assuming the country is US. modify later          
        }
    });

    const res = await checkout.confirm();
    if (res.type === 'error') {
      setError(res.error.message);
    } 
    setLoading(false);
  };

  return (
    <form>
      <PaymentElement options={{ layout: "accordion" }} />
      <div className="flex justify-end">
        {/* <button disabled={!checkout.canConfirm || loading} onClick={handleClick}  */}
        <button
          disabled={loading}
          onClick={handleClick}
          className="bg-blue-500 my-3 w-full justify-center rounded-full text-white px-4 py-3 mt-4 hover:cursor-pointer"
        >
          Pay
        </button>
        {error && <div>{error}</div>}
      </div>
    </form>
  );
}

export default CheckoutForm