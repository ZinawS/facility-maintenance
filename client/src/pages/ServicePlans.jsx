import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { CheckCircle2, Star } from "lucide-react";
import apiService from "../services/api";
import Button from "../components/UI/Button";
import Spinner from "../components/UI/Spinner";
import EmptyState from "../components/UI/EmptyState";
import StripeCheckoutForm from "../components/UI/StripeCheckoutForm";
import Seo from "../components/UI/Seo";

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

const formatPrice = (cents) => `$${(cents / 100).toFixed(2)}`;

function ServicePlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkoutPlanId, setCheckoutPlanId] = useState(null);

  useEffect(() => {
    apiService
      .getServicePlans()
      .then(setPlans)
      .catch((err) => setError(err.message || "Failed to load service plans"))
      .finally(() => setLoading(false));
  }, []);

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <>
      <Seo
        title="Service Plans"
        description="Compare our commercial HVAC and refrigeration maintenance plans and choose the coverage that fits your facility."
        path="/service-plans"
      />
      <motion.div
      initial="hidden"
      animate="visible"
      variants={sectionVariants}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 py-12"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800 dark:text-white">
            Service <span className="text-primary">Plans</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Choose a maintenance plan that fits your facility's needs
          </p>
        </div>

        {loading && <Spinner size="lg" />}
        {error && <p className="text-red-500 text-center">{error}</p>}
        {!loading && !error && plans.length === 0 && <EmptyState message="No plans published yet." />}

        {!loading && !error && plans.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`relative rounded-2xl p-8 flex flex-col shadow-lg border transition-all duration-300 ${
                  plan.is_featured
                    ? "bg-gradient-to-b from-primary to-primary-dark text-white border-transparent scale-105 shadow-2xl"
                    : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
                }`}
              >
                {plan.is_featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-primary text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow">
                    <Star className="w-3 h-3 fill-current" /> Most Popular
                  </span>
                )}
                <h3 className={`text-2xl font-bold mb-2 ${plan.is_featured ? "text-white" : "text-gray-800 dark:text-white"}`}>
                  {plan.name}
                </h3>
                <p className={`text-3xl font-extrabold mb-1 ${plan.is_featured ? "text-white" : "text-primary"}`}>
                  {plan.price_cents !== null ? formatPrice(plan.price_cents) : plan.price_label || "Contact Us"}
                </p>
                {plan.price_cents !== null && plan.billing_period && (
                  <p className={`text-sm mb-6 ${plan.is_featured ? "text-white/80" : "text-gray-500 dark:text-gray-400"}`}>
                    / {plan.billing_period}
                  </p>
                )}
                <ul className="mt-4 space-y-3 flex-grow">
                  {(plan.features || []).map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle2
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.is_featured ? "text-white" : "text-primary"}`}
                      />
                      <span className={plan.is_featured ? "text-white/90" : "text-gray-600 dark:text-gray-300"}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  {plan.price_cents === null ? (
                    <Button
                      href="/contact"
                      className={`block text-center py-3 rounded-full font-semibold w-full transition-all duration-300 ${
                        plan.is_featured ? "bg-white text-primary hover:bg-gray-100" : "bg-primary text-white hover:bg-primary/90"
                      }`}
                    >
                      Request Quote
                    </Button>
                  ) : checkoutPlanId === plan.id ? (
                    stripePromise && (
                      <Elements stripe={stripePromise}>
                        <StripeCheckoutForm
                          label={`Subscribe to ${plan.name}`}
                          buttonLabel={`Pay ${formatPrice(plan.price_cents)}`}
                          createIntent={() => apiService.createPlanPayment(plan.id)}
                        />
                      </Elements>
                    )
                  ) : (
                    <Button
                      onClick={() => setCheckoutPlanId(plan.id)}
                      className={`py-3 rounded-full font-semibold w-full transition-all duration-300 ${
                        plan.is_featured ? "bg-white text-primary hover:bg-gray-100" : "bg-primary text-white hover:bg-primary/90"
                      }`}
                    >
                      Get Started
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
    </>
  );
}

export default ServicePlans;
