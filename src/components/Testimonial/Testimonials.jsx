import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { useInView } from "react-intersection-observer";
import apiService from "../../services/api";
import profile from "../../assets/images/profile1.png";
import Mike from "../../assets/images/mike.png";
import Jane from "../../assets/images/Jane.png";

// Static testimonials as fallback
const staticTestimonials = [
  {
    quote: "FacilityPro saved us $8,200 annually with their maintenance plan!",
    author: "John Smith, Restaurant Owner",
    avatar: profile,
  },
  {
    quote: "Their 24/7 service is a game-changer for our operations.",
    author: "Jane Doe, Healthcare Manager",
    avatar: Jane,
  },
  {
    quote: "Top-notch technicians and unbeatable reliability.",
    author: "Mike Johnson, Office Manager",
    avatar: Mike,
  },
];

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState(staticTestimonials);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  // Fetch testimonials from API
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await apiService.getApprovedFeedback();
        // Validate and transform API data
        const validTestimonials = Array.isArray(response)
          ? response.filter(
              (item) => item && typeof item === "object" && item.quote && item.author
            )
          : [];
        setTestimonials(validTestimonials.length > 0 ? validTestimonials : staticTestimonials);
        setError("");
      } catch (err) {
        console.error("Testimonials fetch error:", err);
        setError(err.message || "Failed to fetch testimonials");
        setTestimonials(staticTestimonials); // Fallback to static data
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
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

  return (
    <motion.section
      ref={ref}
      variants={sectionVariants}
      animate={inView ? "visible" : "hidden"}
      className="py-16 bg-gray-50"
    >
      <div className="container mx-auto text-center px-4 sm:px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800 flex items-center justify-center space-x-2">
          <Quote className="w-8 h-8 text-primary" />
          <span>What Our Clients Say</span>
        </h2>
        {loading && <p className="text-gray-600 text-base">Loading testimonials...</p>}
        {error && <p className="text-red-500 text-base">{error}</p>}
        {!loading && !error && testimonials.length === 0 && (
          <p className="text-gray-600 text-base">No testimonials available.</p>
        )}
        {!loading && !error && testimonials.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                custom={index}
                className="p-6 bg-white rounded-lg shadow-sm hover:shadow-primary/20 transition-all duration-300 border border-gray-100"
              >
                <img
                  src={testimonial.avatar || profile}
                  alt={testimonial.author || "Anonymous"}
                  className="h-10 w-10 rounded-full mx-auto mb-4"
                  loading="lazy"
                />
                <p className="text-gray-700 italic mb-4 text-base">
                  "{testimonial.quote || "No quote provided."}"
                </p>
                <p className="text-gray-800 font-semibold text-base">
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