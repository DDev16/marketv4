import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

function StripePayment({ fees, mintAmount, handlePaymentSuccess, handlePaymentError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardComplete, setCardComplete] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    try {
      const paymentMethod = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });

      if (paymentMethod.error) {
        handlePaymentError(paymentMethod.error.message);
      } else {
        handlePaymentSuccess();
      }
    } catch (error) {
      handlePaymentError('Error processing payment');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <CardElement
        options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            invalid: {
              color: '#9e2146',
            },
          },
          hidePostalCode: true,
        }}
        onChange={(event) => setCardComplete(event.complete)}
      />
      <button
        type="submit"
        disabled={!stripe || !cardComplete}
      >
        Submit Payment
      </button>
    </form>
  );
}

export default StripePayment;
