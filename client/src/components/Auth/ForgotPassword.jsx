import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, AlertCircle, CheckCircle } from "lucide-react";
import apiService from "../../services/api";
import Button from "../UI/Button";

/**
 * ForgotPassword component for requesting a password reset link
 * @returns {JSX.Element} The rendered ForgotPassword component
 */
function ForgotPassword() {
  // State for form input and feedback
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /**
   * Handle form submission to send password reset link
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.forgotPassword(email);
      setMessage(response.message);
      setError("");
    } catch (err) {
      setError("Failed to send reset link");
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
    <motion.div
      initial="hidden"
      animate="visible"
      variants={formVariants}
      className="max-w-md mx-auto mt-8 p-8 bg-white/90 backdrop-blur-md rounded-xl shadow-2xl border border-teal-500/20"
      role="form"
      aria-label="Forgot Password Form"
    >
      <h2 className="text-3xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">
        Forgot Password
      </h2>
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
            htmlFor="email"
          >
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-300 w-5 h-5" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent transition-all duration-300"
              required
              aria-label="Email address"
            />
          </div>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-teal-500/50"
            aria-label="Send Reset Link"
          >
            Send Reset Link
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
}

export default ForgotPassword;
