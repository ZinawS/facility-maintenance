import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { AlertCircle, Truck, Shield, RotateCcw, Package } from "lucide-react";
import apiService from "../services/api";
import Button from "../components/UI/Button";
import Spinner from "../components/UI/Spinner";
import EmptyState from "../components/UI/EmptyState";
import StripeCheckoutForm from "../components/UI/StripeCheckoutForm";

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

const formatPrice = (cents) => `$${(cents / 100).toFixed(2)}`;

function PartsStore() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiService
      .getParts()
      .then(setParts)
      .catch(() => setError("Failed to load parts"))
      .finally(() => setLoading(false));
  }, []);

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" } }),
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={sectionVariants}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 py-12"
      role="main"
      aria-label="Parts Store Page"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <motion.section className="text-center mb-16" variants={sectionVariants}>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800 dark:text-white">
            Parts <span className="text-primary">Store</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            High-quality replacement parts for your HVAC and refrigeration systems
          </p>
        </motion.section>

        <motion.section variants={sectionVariants} className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <Truck className="w-8 h-8 text-primary" />, title: "Fast Shipping", description: "Free shipping on orders over $100" },
            { icon: <Shield className="w-8 h-8 text-primary" />, title: "Quality Guarantee", description: "30-day money-back guarantee" },
            { icon: <RotateCcw className="w-8 h-8 text-primary" />, title: "Easy Returns", description: "Hassle-free return policy" },
          ].map((benefit) => (
            <motion.div
              key={benefit.title}
              variants={cardVariants}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center"
            >
              <div className="bg-primary/10 p-3 rounded-full inline-flex mb-4">{benefit.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{benefit.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{benefit.description}</p>
            </motion.div>
          ))}
        </motion.section>

        {!stripePromise && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center max-w-2xl mx-auto mb-12"
          >
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
            <p className="text-amber-700">Online checkout is temporarily unavailable — please contact us to order.</p>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-2xl mx-auto mb-12"
          >
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <p className="text-red-600">{error}</p>
          </motion.div>
        )}

        {loading && <Spinner size="lg" />}
        {!loading && !error && parts.length === 0 && <EmptyState message="No parts available right now." />}

        {!loading && !error && parts.length > 0 && (
          <motion.section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" variants={sectionVariants}>
            {parts.map((part, index) => (
              <motion.div
                key={part.id}
                variants={cardVariants}
                custom={index}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-gray-100 dark:border-gray-700"
              >
                <div className="h-56 bg-gray-100 dark:bg-gray-900 overflow-hidden flex items-center justify-center">
                  {part.image_url ? (
                    <img
                      src={part.image_url}
                      alt={part.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <Package className="w-16 h-16 text-primary/30" />
                  )}
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">{part.name}</h3>
                    <p className="text-2xl font-bold text-primary">{formatPrice(part.price_cents)}</p>
                  </div>
                  {part.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{part.description}</p>
                  )}
                  {part.stock_quantity === 0 ? (
                    <p className="text-red-500 text-sm font-medium">Out of stock</p>
                  ) : (
                    stripePromise && (
                      <Elements stripe={stripePromise}>
                        <StripeCheckoutForm
                          label={`Pay for ${part.name}`}
                          buttonLabel={`Pay ${formatPrice(part.price_cents)}`}
                          createIntent={() => apiService.createPartPayment(part.id, 1)}
                        />
                      </Elements>
                    )
                  )}
                </div>
              </motion.div>
            ))}
          </motion.section>
        )}

        <motion.section
          className="mt-20 bg-gradient-to-r from-primary to-primary-dark rounded-3xl p-8 md:p-12 text-white text-center"
          variants={sectionVariants}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Need Help Finding the Right Part?</h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Our technicians are here to help you identify the correct parts for your specific equipment.
          </p>
          <Button
            href="/contact"
            className="bg-white text-primary hover:bg-gray-100 py-3 px-8 rounded-full font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl mx-auto"
          >
            Contact Support
          </Button>
        </motion.section>
      </div>
    </motion.div>
  );
}

export default PartsStore;
