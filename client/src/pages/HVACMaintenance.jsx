import { motion } from "framer-motion";
import { Wrench, Star, Tool } from "lucide-react";
import Button from "../components/UI/Button";

/**
 * HVACMaintenance component for HVAC services
 * @returns {JSX.Element} The rendered HVACMaintenance component
 */
function HVACMaintenance() {
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
      aria-label="HVAC Maintenance Page"
    >
      <h1 className="text-4xl font-extrabold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">
        HVAC Maintenance & Repair
      </h1>

      <motion.section
        variants={sectionVariants}
        className="mb-12 bg-white/90 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-teal-500/20"
      >
        <h2 className="text-3xl font-semibold mb-4 text-teal-300 flex items-center space-x-2">
          <Wrench className="w-6 h-6" />
          <span>Our HVAC Services</span>
        </h2>
        <ul className="list-disc max-w-2xl mx-auto space-y-2 text-gray-700">
          <li>Thermostat calibration</li>
          <li>Condensate drain inspection</li>
          <li>Coil cleaning</li>
          <li>Refrigerant level checks</li>
          <li>Electrical connection tightening</li>
          <li>Moving parts lubrication</li>
        </ul>
      </motion.section>

      <motion.section
        variants={sectionVariants}
        className="mb-12 bg-white/90 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-teal-500/20"
      >
        <h2 className="text-3xl font-semibold mb-4 text-teal-300 flex items-center space-x-2">
          <Star className="w-6 h-6" />
          <span>Benefits</span>
        </h2>
        <ul className="list-disc max-w-2xl mx-auto space-y-2 text-gray-700">
          <li>Reduce energy bills by up to 15%</li>
          <li>Extend equipment lifespan</li>
          <li>Prevent costly mid-season breakdowns</li>
        </ul>
      </motion.section>

      <motion.section
        variants={sectionVariants}
        className="mb-12 bg-white/90 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-teal-500/20"
      >
        <h2 className="text-3xl font-semibold mb-4 text-teal-300 flex items-center space-x-2">
          <Tool className="w-6 h-6" />
          <span>Common Repairs</span>
        </h2>
        <ul className="list-disc max-w-2xl mx-auto space-y-2 text-gray-700">
          <li>Compressor failures</li>
          <li>Refrigerant leaks</li>
          <li>Blower motor issues</li>
          <li>Thermostat problems</li>
        </ul>
      </motion.section>

      <motion.section
        variants={sectionVariants}
        className="mb-12 bg-white/90 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-teal-500/20"
      >
        <h2 className="text-3xl font-semibold mb-4 text-teal-300 flex items-center space-x-2">
          <Wrench className="w-6 h-6" />
          <span>Brands We Service</span>
        </h2>
        <div className="flex justify-center space-x-8">
          {["Carrier", "Trane", "Lennox"].map((brand, index) => (
            <motion.img
              key={brand}
              src={`/assets/${brand.toLowerCase()}-logo.png`}
              alt={brand}
              className="h-12"
              variants={cardVariants}
              custom={index}
              whileHover={{ scale: 1.1 }}
            />
          ))}
        </div>
      </motion.section>

      <motion.section variants={sectionVariants} className="text-center">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            href="/contact"
            className="bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-teal-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-teal-500/50"
            aria-label="Request Service"
          >
            Request Service
          </Button>
        </motion.div>
      </motion.section>
    </motion.div>
  );
}

export default HVACMaintenance;
