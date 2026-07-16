import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Lock, AlertCircle } from "lucide-react";
import apiService from "../../services/api";
import Button from "../UI/Button";
import Spinner from "../UI/Spinner";

/**
 * Register component for user registration
 * @returns {JSX.Element} The rendered Register component
 */
function Register() {
  // State for form inputs and error
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  /**
   * Handle form submission for user registration
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setSubmitting(true);
    try {
      await apiService.register(formData);
      navigate("/login");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle input changes for form fields
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      aria-label="Register Form"
    >
      <h2 className="text-3xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">
        Register
      </h2>
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
            htmlFor="name"
          >
            Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-300 w-5 h-5" />
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent transition-all duration-300"
              required
              aria-label="Full name"
            />
          </div>
        </div>
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
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent transition-all duration-300"
              required
              aria-label="Email address"
            />
          </div>
        </div>
        <div className="relative">
          <label
            className="block text-gray-700 font-medium mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-300 w-5 h-5" />
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent transition-all duration-300"
              required
              aria-label="Password"
            />
          </div>
        </div>
        <div className="relative">
          <label
            className="block text-gray-700 font-medium mb-2"
            htmlFor="confirmPassword"
          >
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-300 w-5 h-5" />
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent transition-all duration-300"
              required
              aria-label="Confirm Password"
            />
          </div>
        </div>
        <motion.div whileHover={{ scale: submitting ? 1 : 1.05 }} whileTap={{ scale: submitting ? 1 : 0.95 }}>
          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-teal-500/50"
            aria-label="Register"
          >
            {submitting ? <Spinner size="sm" /> : "Register"}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
}

export default Register;
