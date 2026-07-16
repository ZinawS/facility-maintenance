import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";

/**
 * FAQ component for displaying frequently asked questions
 * @returns {JSX.Element} The rendered FAQ component
 */
function FAQ() {
  const faqs = [
    {
      question: "How often should I service my HVAC?",
      answer:
        "We recommend semi-annual maintenance to ensure optimal performance.",
    },
    {
      question: "What should I check if my walk-in is warm?",
      answer:
        "Check the door gasket, power supply, and temperature settings. If issues persist, call us.",
    },
    {
      question: "Do you offer financing?",
      answer: "Yes, we offer flexible financing options for new installations.",
    },
    {
      question: "What is the average lifespan of a commercial rooftop unit?",
      answer: "Typically 15-20 years with proper maintenance.",
    },
  ];

  // Animation variants for section entrance
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
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
    <motion.div
      initial="hidden"
      animate="visible"
      variants={sectionVariants}
      className="container mx-auto px-6 py-12"
      role="main"
      aria-label="FAQ Page"
    >
      <h1 className="text-4xl font-extrabold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500 flex items-center justify-center space-x-2">
        <HelpCircle className="w-8 h-8" />
        <span>Frequently Asked Questions</span>
      </h1>
      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            custom={index}
            className="p-6 bg-white/90 backdrop-blur-md rounded-lg shadow-lg hover:shadow-teal-500/20 transition-all duration-300 border border-teal-500/20"
          >
            <h3 className="text-xl font-semibold text-gray-800">
              {faq.question}
            </h3>
            <p className="mt-2 text-gray-600">{faq.answer}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default FAQ;
