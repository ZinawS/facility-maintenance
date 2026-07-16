import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/api";
import Spinner from "../components/UI/Spinner";
import EmptyState from "../components/UI/EmptyState";

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" } }),
};

function Services() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiService
      .getServices()
      .then(setServices)
      .catch((err) => setError(err.message || "Failed to load services"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={sectionVariants}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 py-12"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <motion.section className="text-center mb-16" variants={sectionVariants}>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800 dark:text-white">
            Our <span className="text-primary">Services</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Comprehensive facility solutions designed to keep your operations running smoothly and
            efficiently
          </p>
        </motion.section>

        {loading && <Spinner size="lg" />}
        {error && <p className="text-red-500 text-center py-10">{error}</p>}
        {!loading && !error && services.length === 0 && <EmptyState message="No services listed yet." />}

        {!loading && !error && services.length > 0 && (
          <motion.section
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={sectionVariants}
          >
            {services.map((service, index) => {
              const Icon = Icons[service.icon] || Icons.Settings;
              return (
                <motion.div
                  key={service.id}
                  variants={cardVariants}
                  custom={index}
                  className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-gray-100 dark:border-gray-700 group cursor-pointer"
                  onClick={() => navigate(`/services/${service.slug}`)}
                  whileHover={{ y: -5 }}
                >
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="bg-primary/10 p-4 rounded-xl inline-flex self-start mb-5 group-hover:bg-primary/20 transition-colors duration-300">
                      <Icon className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3 group-hover:text-primary transition-colors duration-300">
                      {service.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-5 flex-grow">
                      {service.short_description}
                    </p>
                    {service.features?.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 text-sm uppercase tracking-wide">
                          Key Features:
                        </h4>
                        <ul className="space-y-2">
                          {service.features.map((feature) => (
                            <li key={feature} className="flex items-start">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-3 flex-shrink-0" />
                              <span className="text-gray-600 dark:text-gray-300 text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <button className="self-start text-primary font-semibold flex items-center group-hover:underline mt-auto">
                      Learn more
                      <Icons.ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.section>
        )}

        <motion.section
          className="mt-20 bg-gradient-to-r from-primary to-primary-dark rounded-3xl p-8 md:p-12 text-white"
          variants={sectionVariants}
        >
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Need a Custom Solution?</h2>
            <p className="text-xl mb-8 opacity-90">
              Every facility is unique. Contact us for a personalized service plan tailored to your
              specific needs.
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
