import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { Wrench, Hammer } from "lucide-react";
import FeedbackForm from "./FeedbackForm";
import ServiceRequestPanel from "./ServiceRequestPanel";
import EmptyState from "../UI/EmptyState";

/**
 * ClientDashboard component for displaying service history and equipment profiles
 * @param {Object} props - Component props
 * @param {Array} props.serviceHistory - Array of service history items
 * @param {Array} props.equipment - Array of equipment profiles
 * @returns {JSX.Element} The rendered ClientDashboard component
 */
function ClientDashboard({ serviceHistory, equipment }) {
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

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
      aria-label="Client Dashboard"
    >
      <h2 className="text-3xl font-bold mb-8 text-center text-primary">
        Client Dashboard
      </h2>

      <motion.section
        variants={sectionVariants}
        className="mb-12 bg-white rounded-lg shadow-md p-6"
      >
        <h3 className="text-2xl font-semibold mb-4 flex items-center space-x-2 text-primary">
          <Wrench className="w-6 h-6" />
          <span>Service History</span>
        </h3>
        {serviceHistory.length === 0 && <EmptyState message="No service history yet." />}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceHistory.map((item, index) => (
            <motion.div
              key={item.id}
              variants={cardVariants}
              custom={index}
              className="p-6 bg-white rounded-lg shadow-md hover:shadow-primary/20 transition-all duration-300"
            >
              <p className="text-gray-700">
                <strong>Date:</strong> {item.date}
              </p>
              <p className="text-gray-700">
                <strong>Service:</strong> {item.service}
              </p>
              <p className="text-gray-700">
                <strong>Status:</strong> {item.status}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        variants={sectionVariants}
        className="mb-12 bg-white rounded-lg shadow-md p-6"
      >
        <h3 className="text-2xl font-semibold mb-4 flex items-center space-x-2 text-primary">
          <Hammer className="w-6 h-6" />
          <span>Equipment Profiles</span>
        </h3>
        {equipment.length === 0 && <EmptyState message="No equipment on file yet." />}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipment.map((equip, index) => (
            <motion.div
              key={equip.id}
              variants={cardVariants}
              custom={index}
              className="p-6 bg-white rounded-lg shadow-md hover:shadow-primary/20 transition-all duration-300"
            >
              <p className="text-gray-700">
                <strong>Model:</strong> {equip.model}
              </p>
              <p className="text-gray-700">
                <strong>Serial:</strong> {equip.serial}
              </p>
              <p className="text-gray-700">
                <strong>Last Service:</strong> {equip.last_service}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section variants={sectionVariants}>
        <ServiceRequestPanel />
      </motion.section>

      <motion.section variants={sectionVariants}>
        <FeedbackForm />
      </motion.section>
    </motion.div>
  );
}

export default ClientDashboard;
