import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { useInView } from "react-intersection-observer";
import apiService from "../../services/api";

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  useEffect(() => {
    let active = true;
    apiService
      .getApprovedFeedback()
      .then((data) => {
        if (active) setTestimonials(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (active) setError(err.message || "Failed to fetch testimonials");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const cardVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
    }),
  };

  if (!loading && !error && testimonials.length === 0) return null;

  return (
    <motion.section
      ref={ref}
      variants={sectionVariants}
      animate={inView ? "visible" : "hidden"}
      className="py-16 bg-gray-50 dark:bg-gray-900"
    >
      <div className="container mx-auto text-center px-4 sm:px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800 dark:text-white flex items-center justify-center space-x-2">
          <Quote className="w-8 h-8 text-primary" />
          <span>What Our Clients Say</span>
        </h2>
        {loading && <p className="text-gray-600 dark:text-gray-300 text-base">Loading testimonials...</p>}
        {error && <p className="text-red-500 text-base">{error}</p>}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                variants={cardVariants}
                custom={index}
                className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-primary/20 transition-all duration-300 border border-gray-100 dark:border-gray-700"
              >
                <p className="text-gray-700 dark:text-gray-200 italic mb-4 text-base">
                  "{testimonial.quote}"
                </p>
                <p className="text-gray-800 dark:text-gray-100 font-semibold text-base">
                  {testimonial.author || "Anonymous"}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
};

export default Testimonials;
