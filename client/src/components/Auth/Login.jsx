import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, AlertCircle } from "lucide-react";
import apiService from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import Button from "../UI/Button";

/**
 * Login component for user authentication
 * @returns {JSX.Element} The rendered Login component
 */
function Login() {
  const { setUser } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.login({ email, password });
      setUser(response.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid credentials");
    }
  };

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
      className="max-w-md mx-auto mt-8 p-8 bg-white rounded-lg shadow-md"
      role="form"
      aria-label="Login Form"
    >
      <h2 className="text-3xl font-bold mb-6 text-center text-primary">
        Login
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
            htmlFor="email"
          >
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
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
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
              required
              aria-label="Password"
            />
          </div>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            type="submit"
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/80 transition-all duration-300"
            aria-label="Login"
          >
            Login
          </Button>
        </motion.div>
      </form>
      <div className="mt-6 text-center space-y-2">
        <p>
          <a
            href="/forgot-password"
            className="text-primary hover:text-primary/80 transition-colors duration-300 hover:underline"
            aria-label="Forgot Password"
          >
            Forgot Password?
          </a>
        </p>
        <p>
          Don't have an account?{" "}
          <a
            href="/register"
            className="text-primary hover:text-primary/80 transition-colors duration-300 hover:underline"
            aria-label="Register"
          >
            Register
          </a>
        </p>
      </div>
    </motion.div>
  );
}

export default Login;
