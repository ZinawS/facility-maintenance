import { useState } from "react";
import { motion } from "framer-motion";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { AlertCircle, CheckCircle, CreditCard } from "lucide-react";
import Button from "./Button";

/**
 * Generic Stripe card-payment form. The caller supplies `createIntent`,
 * which must call the backend and return `{ clientSecret }` — the backend
 * always computes the charged amount server-side, never trusting a client
 * value, so this component only needs a label to display.
 */
function StripeCheckoutForm({ label, buttonLabel, createIntent, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      setError("Payment system not initialized");
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      const { clientSecret } = await createIntent();
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });
      if (error) {
        setError(error.message);
        setSuccess(false);
      } else if (paymentIntent.status === "succeeded") {
        setSuccess(true);
        onSuccess?.();
      }
    } catch (err) {
      setError(err.message || "Payment processing failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
      <div className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus-within:ring-2 focus-within:ring-primary transition-all duration-300 bg-gray-50 dark:bg-gray-900">
        <CardElement
          options={{
            style: { base: { fontSize: "16px", color: "#374151", "::placeholder": { color: "#9CA3AF" } } },
          }}
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 flex items-start space-x-2 text-sm p-3 bg-red-50 rounded-lg"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </motion.p>
      )}
      {success && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-green-600 flex items-start space-x-2 text-sm p-3 bg-green-50 rounded-lg"
        >
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>Payment successful! Your order is being processed.</span>
        </motion.p>
      )}
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          type="submit"
          className="flex items-center justify-center space-x-2 w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={label}
          disabled={!stripe || processing}
        >
          {processing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              <span>{buttonLabel}</span>
            </>
          )}
        </Button>
      </motion.div>
    </form>
  );
}

export default StripeCheckoutForm;
