import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";

/**
 * PaymentsList component for displaying payment records
 * @param {Object} props - Component props
 * @param {Array} props.payments - List of payment records
 * @returns {JSX.Element} The rendered PaymentsList component
 */
function PaymentsList({ payments }) {
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
      className="mb-12 bg-white/90 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-teal-500/20"
    >
      <h3 className="text-2xl font-semibold mb-4 text-teal-300 flex items-center space-x-2">
        <DollarSign className="w-6 h-6" />
        <span>Payments</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {payments.map((payment, index) => (
          <motion.div
            key={payment.id}
            variants={cardVariants}
            custom={index}
            className="p-6 bg-white rounded-lg shadow-lg hover:shadow-teal-500/20 transition-all duration-300 border border-gray-200"
          >
            <p className="text-gray-700">
              <strong>User:</strong> {payment.user_name || "Guest"}
            </p>
            <p className="text-gray-700">
              <strong>Amount:</strong> ${payment.amount}
            </p>
            <p className="text-gray-700">
              <strong>Description:</strong> {payment.description}
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Status:</strong> {payment.status}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

export default PaymentsList;
