import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, AlertCircle, CheckCircle } from "lucide-react";
import apiService from "../../services/api";
import Button from "../UI/Button";

/**
 * FeedbackForm component for submitting user feedback
 * @returns {JSX.Element} The rendered FeedbackForm component
 */
function FeedbackForm() {
  // State for feedback input and feedback messages
  const [feedback, setFeedback] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /**
   * Handle form submission for feedback
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiService.submitFeedback({ comment: feedback });
      setMessage("Feedback submitted successfully");
      setFeedback("");
      setError("");
    } catch (err) {
      setError("Failed to submit feedback");
      setMessage("");
    }
  };

  // Animation variants for form entrance
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <motion.section
      variants={formVariants}
      initial="hidden"
      animate="visible"
      className="bg-white/90 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-teal-500/20"
      role="form"
      aria-label="Feedback Form"
    >
      <h3 className="text-2xl font-semibold mb-4 text-teal-300 flex items-center space-x-2">
        <MessageSquare className="w-6 h-6" />
        <span>Submit Feedback</span>
      </h3>
      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-green-500 mb-4 flex items-center space-x-2"
        >
          <CheckCircle className="w-5 h-5" />
          <span>{message}</span>
        </motion.p>
      )}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-500 mb-4 flex items-center space-x-2"
        >
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </motion.p>
      )}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="relative">
          <label
            className="block text-gray-700 font-medium mb-2"
            htmlFor="feedback"
          >
            Your Feedback
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-4 text-teal-300 w-5 h-5" />
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent transition-all duration-300"
              rows="4"
              required
              aria-label="Feedback"
            ></textarea>
          </div>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            type="submit"
            className="flex items-center space-x-2 w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-teal-500/50"
            aria-label="Submit Feedback"
          >
            <MessageSquare className="w-5 h-5" />
            <span>Submit Feedback</span>
          </Button>
        </motion.div>
      </form>
    </motion.section>
  );
}

export default FeedbackForm;
