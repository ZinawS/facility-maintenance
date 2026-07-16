import { motion } from "framer-motion";
import { Wrench, AlertTriangle, CheckCircle } from "lucide-react";
import Button from "../components/UI/Button";

/**
 * CoolerMaintenance component for walk-in cooler/freezer services
 * @returns {JSX.Element} The rendered CoolerMaintenance component
 */
function CoolerMaintenance() {
  // Animation variants for section entrance
  const sectionVariants = {
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
      variants={sectionVariants}
      className="container mx-auto px-6 py-12"
      role="main"
      aria-label="Cooler Maintenance Page"
    >
      <h1 className="text-4xl font-extrabold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">
        Walk-in Cooler/Freezer Service
      </h1>

      <motion.section
        variants={sectionVariants}
        className="mb-12 bg-white/90 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-teal-500/20"
      >
        <h2 className="text-3xl font-semibold mb-4 text-teal-300 flex items-center space-x-2">
          <Wrench className="w-6 h-6" />
          <span>Why It Matters</span>
        </h2>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
          Prevent spoilage, health code violations, and business interruptions
          with our expert cooler maintenance services.
        </p>
      </motion.section>

      <motion.section
        variants={sectionVariants}
        className="mb-12 bg-white/90 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-teal-500/20"
      >
        <h2 className="text-3xl font-semibold mb-4 text-teal-300 flex items-center space-x-2">
          <CheckCircle className="w-6 h-6" />
          <span>Preventative Maintenance Checklist</span>
        </h2>
        <ul className="list-disc max-w-2xl mx-auto space-y-2 text-gray-700">
          <li>Door & gasket inspection</li>
          <li>Drain line cleaning & trap priming</li>
          <li>Coil cleaning (evaporator and condenser)</li>
          <li>Defrost cycle & heater element check</li>
          <li>Temperature calibration & alarm testing</li>
          <li>Lighting & shelving inspection</li>
        </ul>
      </motion.section>

      <motion.section
        variants={sectionVariants}
        className="mb-12 bg-white/90 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-teal-500/20"
      >
        <h2 className="text-3xl font-semibold mb-4 text-teal-300 flex items-center space-x-2">
          <AlertTriangle className="w-6 h-6" />
          <span>Emergency Repairs</span>
        </h2>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
          Fast response for temperature alarms and breakdowns, 24/7.
        </p>
      </motion.section>

      <motion.section variants={sectionVariants} className="text-center">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            href="/contact"
            className="bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-teal-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-teal-500/50"
            aria-label="Schedule Maintenance"
          >
            Schedule Maintenance
          </Button>
        </motion.div>
      </motion.section>
    </motion.div>
  );
}

export default CoolerMaintenance;
