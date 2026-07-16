import React from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Button from "../UI/Button";

/**
 * ServiceModal component to display service details in a modal
 * @param {Object} props - Component props
 * @param {Object} props.service - Service details (name, description, link)
 * @param {Function} props.onClose - Function to close the modal
 * @returns {JSX.Element} The rendered ServiceModal component
 */
function ServiceModal({ service, onClose }) {
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        role="dialog"
        aria-labelledby="modal-title"
        aria-modal="true"
      >
        <div className="bg-white rounded-xl p-8 max-w-lg w-full mx-4 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
          <h2
            id="modal-title"
            className="text-2xl font-semibold text-gray-800 mb-4"
          >
            {service.name}
          </h2>
          <p className="text-gray-600 mb-6">{service.description}</p>
          <Button
            href={service.link}
            className="bg-primary text-white py-2 px-4 rounded-lg font-semibold hover:bg-primary/80 transition-all duration-300"
            aria-label={`Visit ${service.name} page`}
          >
            Explore Service
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}



export default ServiceModal;
