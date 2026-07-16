import { motion } from "framer-motion";
import {
  Wrench,
  Snowflake,
  Thermometer,
  Zap,
  Wind,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function Services() {
  const navigate = useNavigate();

  const services = [
    {
      name: "HVAC Maintenance & Repair",
      link: "/services/hvac",
      desc: "Comprehensive HVAC maintenance and repair services to keep your systems running efficiently year-round.",
      icon: <Settings className="w-10 h-10 text-primary" />,
      features: [
        "24/7 Emergency Service",
        "Preventative Maintenance",
        "System Diagnostics",
      ],
    },
    {
      name: "Walk-in Cooler/Freezer Service",
      link: "/services/cooler",
      desc: "Preventative maintenance and emergency repairs for walk-in units to protect your inventory.",
      icon: <Snowflake className="w-10 h-10 text-primary" />,
      features: [
        "Temperature Monitoring",
        "Door Seal Replacement",
        "Coil Cleaning",
      ],
    },
    {
      name: "Commercial Refrigeration",
      link: "/services/refrigeration",
      desc: "Expert service for reach-ins, display cases, and ice machines to keep your business running smoothly.",
      icon: <Thermometer className="w-10 h-10 text-primary" />,
      features: [
        "Display Case Maintenance",
        "Compressor Repair",
        "Condenser Cleaning",
      ],
    },
    {
      name: "HVAC Installation",
      link: "/services/installation",
      desc: "Professional installation of new HVAC systems tailored to your facility's specific needs.",
      icon: <Wrench className="w-10 h-10 text-primary" />,
      features: [
        "System Sizing",
        "Energy-Efficient Options",
        "Ductwork Design",
      ],
    },
    {
      name: "Energy Efficiency Auditing",
      link: "/services/energy",
      desc: "Comprehensive energy audits to optimize your facility's energy usage and reduce costs.",
      icon: <Zap className="w-10 h-10 text-primary" />,
      features: [
        "Utility Bill Analysis",
        "Infrared Scanning",
        "Customized Recommendations",
      ],
    },
    {
      name: "Indoor Air Quality Solutions",
      link: "/services/iaq",
      desc: "Advanced solutions to improve indoor air quality for healthier environments.",
      icon: <Wind className="w-10 h-10 text-primary" />,
      features: [
        "Air Purification",
        "Ventilation Assessment",
        "Filtration Systems",
      ],
    },
  ];

  // Animation variants for section entrance
  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  // Animation variants for cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
    }),
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={sectionVariants}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12"
    >
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header Section */}
        <motion.section
          className="text-center mb-16"
          variants={sectionVariants}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
            Our <span className="text-primary">Services</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive facility solutions designed to keep your operations
            running smoothly and efficiently
          </p>
        </motion.section>

        {/* Services Grid */}
        <motion.section
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={sectionVariants}
        >
          {services.map((service, index) => (
            <motion.div
              key={service.name}
              variants={cardVariants}
              custom={index}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-gray-100 group cursor-pointer"
              onClick={() => navigate(service.link)}
              whileHover={{ y: -5 }}
            >
              <div className="p-6 flex flex-col flex-grow">
                <div className="bg-primary/10 p-4 rounded-xl inline-flex self-start mb-5 group-hover:bg-primary/20 transition-colors duration-300">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-primary transition-colors duration-300">
                  {service.name}
                </h3>
                <p className="text-gray-600 mb-5 flex-grow">{service.desc}</p>
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">
                    Key Features:
                  </h4>
                  <ul className="space-y-2">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button className="self-start text-primary font-semibold flex items-center group-hover:underline mt-auto">
                  Learn more
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
        </motion.section>

        {/* CTA Section */}
        <motion.section
          className="mt-20 bg-gradient-to-r from-primary to-primary-dark rounded-3xl p-8 md:p-12 text-white"
          variants={sectionVariants}
        >
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Need a Custom Solution?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Every facility is unique. Contact us for a personalized service
              plan tailored to your specific needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/contact")}
                className="bg-white text-primary hover:bg-gray-100 py-3 px-8 rounded-full font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Get a Free Consultation
              </button>
              <button
                onClick={() => navigate("/about")}
                className="bg-transparent border-2 border-white hover:bg-white/10 text-white py-3 px-8 rounded-full font-semibold text-lg transition-all duration-300"
              >
                Learn About Us
              </button>
            </div>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}

export default Services;
