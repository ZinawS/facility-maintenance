import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Quote, AlertCircle } from "lucide-react";
import apiService from "../services/api";

/**
 * Testimonials component for displaying approved feedback
 * @returns {JSX.Element} The rendered Testimonials component
 */
function Testimonials() {
  const [feedback, setFeedback] = useState([]);
  const [error, setError] = useState("");

  /**
   * Fetch three random approved feedback items on component mount
   */
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const feedbackData = await apiService.getApprovedFeedback();
        setFeedback(feedbackData);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to fetch testimonials");
        console.error("Error fetching testimonials:", err);
      }
    };
    fetchFeedback();
  }, []);

  // Animation variants for section entrance
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  // Animation variants for cards
  const cardVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
    }),
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={sectionVariants}
      className="container mx-auto px-6 py-12"
      role="main"
      aria-label="Testimonials Page"
    >
      <h1 className="text-4xl font-extrabold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500 flex items-center justify-center space-x-2">
        <Quote className="w-8 h-8" />
        <span>Testimonials</span>
      </h1>
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-500 mb-4 flex items-center space-x-2 text-center"
        >
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </motion.p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {feedback.map((item, index) => (
          <motion.div
            key={item.id}
            variants={cardVariants}
            custom={index}
            className="p-6 bg-white/90 backdrop-blur-md rounded-lg shadow-lg hover:shadow-teal-500/20 transition-all duration-300 border border-teal-500/20"
          >
            <p className="italic text-gray-700 mb-4">"{item.comment}"</p>
            <p className="font-semibold text-gray-800">{item.user}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default Testimonials;
