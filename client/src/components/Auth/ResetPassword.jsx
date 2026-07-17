import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle } from "lucide-react";
import apiService from "../../services/api";
import Button from "../UI/Button";
import Spinner from "../UI/Spinner";
import PasswordInput from "../UI/PasswordInput";
import PasswordStrengthMeter from "../UI/PasswordStrengthMeter";
import { getPasswordStrength } from "../../utils/passwordStrength";

/**
 * ResetPassword component for resetting user password
 * @returns {JSX.Element} The rendered ResetPassword component
 */
function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!getPasswordStrength(password).meetsRequirement) {
      setError("Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number");
      return;
    }
    setSubmitting(true);
    try {
      const response = await apiService.resetPassword(token, password);
      setMessage(response.message);
      setError("");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message || "Failed to reset password");
      setMessage("");
    } finally {
      setSubmitting(false);
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
      className="max-w-md mx-auto mt-8 p-8 bg-white/90 backdrop-blur-md rounded-xl shadow-2xl border border-teal-500/20"
      role="form"
      aria-label="Reset Password Form"
    >
      <h2 className="text-3xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">
        Reset Password
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
        <div>
          <label className="block text-gray-700 font-medium mb-2" htmlFor="password">
            New Password
          </label>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            accentClass="text-teal-400"
          />
          <PasswordStrengthMeter password={password} />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <PasswordInput
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            accentClass="text-teal-400"
          />
        </div>
        <motion.div whileHover={{ scale: submitting ? 1 : 1.05 }} whileTap={{ scale: submitting ? 1 : 0.95 }}>
          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-teal-500/50 disabled:opacity-60"
            aria-label="Reset Password"
          >
            {submitting ? <Spinner size="sm" /> : "Reset Password"}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
}

export default ResetPassword;
