import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  Star,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import apiService from "../services/api";
import Button from "../components/UI/Button";
import { PartList } from "../utility/PartList";

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

/**
 * CheckoutForm component for processing payments
 * @param {Object} props - Component props
 * @param {Object} props.item - The item being purchased
 * @returns {JSX.Element} The rendered CheckoutForm component
 */
function CheckoutForm({ item }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);

  /**
   * Handle payment submission
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      setError("Payment system not initialized");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const { clientSecret } = await apiService.createPaymentIntent({
        amount: item.price * 100, // Convert to cents
        currency: "usd",
        description: `Purchase of ${item.name}`,
      });
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: { card: elements.getElement(CardElement) },
        }
      );
      if (error) {
        setError(error.message);
        setSuccess(false);
      } else if (paymentIntent.status === "succeeded") {
        setSuccess(true);
        setError(null);
      }
    } catch (err) {
      setError(err.message || "Payment processing failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
      <div className="p-3 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-primary transition-all duration-300 bg-gray-50">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#374151",
                "::placeholder": {
                  color: "#9CA3AF",
                },
              },
            },
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
          aria-label={`Pay for ${item.name}`}
          disabled={!stripe || processing}
        >
          {processing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              <span>Pay ${item.price}</span>
            </>
          )}
        </Button>
      </motion.div>
    </form>
  );
}

/**
 * PartsStore component for displaying available parts
 * @returns {JSX.Element} The rendered PartsStore component
 */
function PartsStore() {
  const [parts, setParts] = useState([]);
  const [error, setError] = useState(null);
  const [selectedPart, setSelectedPart] = useState(null);

  /**
   * Fetch parts data (mocked for now)
   */
  useEffect(() => {
    try {
      // Using PartList from utility if available, otherwise fallback
      setParts(
        PartList && PartList.length > 0
          ? PartList
          : [
              {
                id: 1,
                name: "HVAC Filter",
                price: 99.99,
                image: "/assets/parts/filter.jpg",
                rating: 4.5,
                reviews: 42,
              },
              {
                id: 2,
                name: "Cooler Gasket",
                price: 49.99,
                image: "/assets/parts/gasket.jpg",
                rating: 4.2,
                reviews: 28,
              },
              {
                id: 3,
                name: "Condenser Coil",
                price: 199.99,
                image: "/assets/parts/coil.jpg",
                rating: 4.8,
                reviews: 67,
              },
            ]
      );
    } catch (err) {
      setError("Failed to load parts");
    }
  }, []);

  // Animation variants for section entrance
  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  // Animation variants for cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
    }),
  };

  if (!stripePromise) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12"
        role="main"
        aria-label="Parts Store Page"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-2xl mx-auto"
          >
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-700 mb-2">
              Payment System Not Configured
            </h2>
            <p className="text-red-600">
              Please contact support to enable purchases.
            </p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={sectionVariants}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12"
      role="main"
      aria-label="Parts Store Page"
    >
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header Section */}
        <motion.section
          className="text-center mb-16"
          variants={sectionVariants}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
            Parts <span className="text-primary">Store</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            High-quality replacement parts for your HVAC and refrigeration
            systems
          </p>
        </motion.section>

        {/* Benefits Section */}
        <motion.section
          variants={sectionVariants}
          className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            {
              icon: <Truck className="w-8 h-8 text-primary" />,
              title: "Fast Shipping",
              description: "Free shipping on orders over $100",
            },
            {
              icon: <Shield className="w-8 h-8 text-primary" />,
              title: "Quality Guarantee",
              description: "30-day money-back guarantee",
            },
            {
              icon: <RotateCcw className="w-8 h-8 text-primary" />,
              title: "Easy Returns",
              description: "Hassle-free return policy",
            },
          ].map((benefit, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              custom={index}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center"
            >
              <div className="bg-primary/10 p-3 rounded-full inline-flex mb-4">
                {benefit.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600">{benefit.description}</p>
            </motion.div>
          ))}
        </motion.section>

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

        {/* Parts Grid */}
        <motion.section
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={sectionVariants}
        >
          {parts.map((part, index) => (
            <motion.div
              key={part.id}
              variants={cardVariants}
              custom={index}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-gray-100"
            >
              <div className="h-56 bg-gray-100 overflow-hidden">
                <img
                  src={part.image || "/assets/parts/placeholder.jpg"}
                  alt={part.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = "/assets/parts/placeholder.jpg";
                  }}
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-800">
                    {part.name}
                  </h3>
                  <p className="text-2xl font-bold text-primary">
                    ${part.price}
                  </p>
                </div>

                {part.rating && (
                  <div className="flex items-center mb-4">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(part.rating) ? "fill-current" : ""}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 ml-2">
                      {part.rating} ({part.reviews} reviews)
                    </span>
                  </div>
                )}

                <Elements stripe={stripePromise}>
                  <CheckoutForm item={part} />
                </Elements>
              </div>
            </motion.div>
          ))}
        </motion.section>

        {/* Support Section */}
        <motion.section
          className="mt-20 bg-gradient-to-r from-primary to-primary-dark rounded-3xl p-8 md:p-12 text-white text-center"
          variants={sectionVariants}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Need Help Finding the Right Part?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Our technicians are here to help you identify the correct parts for
            your specific equipment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary hover:bg-gray-100 py-3 px-8 rounded-full font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl">
              Contact Support
            </button>
            <button className="bg-transparent border-2 border-white hover:bg-white/10 py-3 px-8 rounded-full font-semibold text-lg transition-all duration-300">
              Schedule Consultation
            </button>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}

export default PartsStore;
