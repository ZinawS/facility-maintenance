import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import apiService from "../services/api";
import Spinner from "../components/UI/Spinner";
import EmptyState from "../components/UI/EmptyState";
import Seo from "../components/UI/Seo";

/**
 * FAQ page, backed by the admin-managed /api/public/faqs resource.
 */
function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiService
      .getFaqs()
      .then(setFaqs)
      .catch((err) => setError(err.message || "Failed to load FAQs"))
      .finally(() => setLoading(false));
  }, []);

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const cardVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" } }),
  };

  return (
    <>
      <Seo
        title="Frequently Asked Questions"
        description="Answers to common questions about HVAC maintenance schedules, walk-in cooler troubleshooting, financing, and commercial rooftop unit lifespan."
        path="/faq"
      />
      <motion.div
      initial="hidden"
      animate="visible"
      variants={sectionVariants}
      className="container mx-auto px-6 py-12 min-h-[60vh]"
      role="main"
      aria-label="FAQ Page"
    >
      <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-800 dark:text-white flex items-center justify-center space-x-2">
        <HelpCircle className="w-8 h-8 text-primary" />
        <span>Frequently Asked Questions</span>
      </h1>

      {loading && <Spinner size="lg" />}
      {error && <p className="text-red-500 text-center">{error}</p>}
      {!loading && !error && faqs.length === 0 && <EmptyState message="No FAQs published yet." />}

      <div className="space-y-6 max-w-3xl mx-auto">
        {faqs.map((faq, index) => (
          <motion.div
            key={faq.id}
            variants={cardVariants}
            custom={index}
            className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-primary/20 transition-all duration-300 border border-gray-100 dark:border-gray-700"
          >
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{faq.question}</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">{faq.answer}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
    </>
  );
}

export default FAQ;
