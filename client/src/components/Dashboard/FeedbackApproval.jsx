import { motion } from "framer-motion";
import { MessageSquare, CheckCircle, X } from "lucide-react";
import apiService from "../../services/api";
import Button from "../UI/Button";

/**
 * FeedbackApproval component for approving or rejecting feedback
 * @param {Object} props - Component props
 * @param {Array} props.feedback - List of feedback items
 * @param {Function} props.setFeedback - Function to update feedback state
 * @param {Function} props.setSuccess - Function to set success message
 * @param {Function} props.setError - Function to set error message
 * @returns {JSX.Element} The rendered FeedbackApproval component
 */
function FeedbackApproval({ feedback, setFeedback, setSuccess, setError }) {
  /**
   * Approve feedback
   * @param {number} id - Feedback ID
   */
  const handleApproveFeedback = async (id) => {
    try {
      await apiService.approveFeedback(id);
      setFeedback(
        feedback.map((item) =>
          item.id === id ? { ...item, status: "approved" } : item
        )
      );
      setSuccess("Feedback approved successfully");
      setError("");
    } catch (err) {
      setError(err.message || "Failed to approve feedback");
      setSuccess("");
    }
  };

  /**
   * Reject feedback
   * @param {number} id - Feedback ID
   */
  const handleRejectFeedback = async (id) => {
    try {
      await apiService.rejectFeedback(id);
      setFeedback(
        feedback.map((item) =>
          item.id === id ? { ...item, status: "rejected" } : item
        )
      );
      setSuccess("Feedback rejected successfully");
      setError("");
    } catch (err) {
      setError(err.message || "Failed to reject feedback");
      setSuccess("");
    }
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
    <motion.section
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: "easeOut" },
        },
      }}
      className="bg-white/90 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-teal-500/20"
    >
      <h3 className="text-2xl font-semibold mb-4 text-teal-300 flex items-center space-x-2">
        <MessageSquare className="w-6 h-6" />
        <span>Feedback Approval</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {feedback.map((item, index) => (
          <motion.div
            key={item.id}
            variants={cardVariants}
            custom={index}
            className="p-6 bg-white rounded-lg shadow-lg hover:shadow-teal-500/20 transition-all duration-300 border border-gray-200"
          >
            <p className="text-gray-700">
              <strong>User:</strong> {item.user_name || item.name || "Guest"}
            </p>
            <p className="text-gray-700">
              <strong>Email:</strong> {item.email || "N/A"}
            </p>
            <p className="text-gray-700">
              <strong>Phone:</strong> {item.phone || "N/A"}
            </p>
            <p className="text-gray-700">
              <strong>Equipment Type:</strong> {item.equipment_type || "N/A"}
            </p>
            <p className="text-gray-700">
              <strong>Comment:</strong> {item.comment}
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Status:</strong> {item.status}
            </p>
            <div className="flex space-x-4">
              {item.status === "pending" && (
                <>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => handleApproveFeedback(item.id)}
                      className="flex items-center space-x-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white py-2 px-4 rounded-lg hover:from-teal-600 hover:to-blue-600 transition-all duration-300"
                      aria-label={`Approve feedback from ${item.user_name || item.name || "Guest"}`}
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Approve</span>
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => handleRejectFeedback(item.id)}
                      className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300"
                      aria-label={`Reject feedback from ${item.user_name || item.name || "Guest"}`}
                    >
                      <X className="w-5 h-5" />
                      <span>Reject</span>
                    </Button>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

export default FeedbackApproval;
