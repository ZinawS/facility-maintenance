import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";

/**
 * ContactMessagesList component for displaying contact messages
 * @param {Object} props - Component props
 * @param {Array} props.contactMessages - List of contact messages
 * @returns {JSX.Element} The rendered ContactMessagesList component
 */
function ContactMessagesList({ contactMessages }) {
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
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
      }}
      className="mb-12 bg-white/90 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-teal-500/20"
    >
      <h3 className="text-2xl font-semibold mb-4 text-teal-300 flex items-center space-x-2">
        <MessageSquare className="w-6 h-6" />
        <span>Contact Messages</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contactMessages.map((message, index) => (
          <motion.div
            key={message.id}
            variants={cardVariants}
            custom={index}
            className="p-6 bg-white rounded-lg shadow-lg hover:shadow-teal-500/20 transition-all duration-300 border border-gray-200"
          >
            <p className="text-gray-700">
              <strong>Name:</strong> {message.name || "N/A"}
            </p>
            <p className="text-gray-700">
              <strong>Email:</strong> {message.email || "N/A"}
            </p>
            <p className="text-gray-700">
              <strong>Phone:</strong> {message.phone || "N/A"}
            </p>
            <p className="text-gray-700">
              <strong>Equipment Type:</strong> {message.equipment_type || "N/A"}
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Message:</strong> {message.message}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

export default ContactMessagesList;