import React, { useState, useEffect, memo } from "react";
import { motion } from "framer-motion";
import {
  Wrench,
  Star,
  ArrowRight,
  Shield,
  Clock,
  Users,
  Award,
  Settings,
} from "lucide-react";
import { Tilt } from "react-tilt";
import { useInView } from "react-intersection-observer";
import apiService from "../services/api";
import Seo from "../components/UI/Seo";
import { resolveMediaUrl } from "../utils/media";
import Button from "../components/UI/Button";
import BlogSection from "../components/Blog/BlogSection";
import Testimonials from "../components/Testimonial/Testimonials";
import backgroundImage from "../assets/images/Hero.png";
import { useNavigate } from "react-router-dom";

const Home = memo(() => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState({
    services: true,
    testimonials: true,
    blogs: true,
  });
  const [error, setError] = useState({
    services: "",
    testimonials: "",
    blogs: "",
  });

  const navigate = useNavigate();

  // Scroll-triggered visibility for sections
  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });
  const [servicesRef, servicesInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });
  const [blogRef, blogInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });
  const [whyChooseUsRef, whyChooseUsInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  // Fetch services data (testimonials/blogs are handled in their own components)
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await apiService.getServices();
        setServices(data.slice(0, 3));
        setError((prev) => ({ ...prev, services: "" }));
      } catch (err) {
        console.error("Fetch error:", err);
        setError((prev) => ({ ...prev, services: err.message || "Failed to fetch services" }));
      } finally {
        setLoading((prev) => ({ ...prev, services: false }));
      }
    };
    fetchServices();
  }, []);

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
    }),
  };

  return (
    <>
      <Seo
        title="Home"
        description="Commercial HVAC, refrigeration, and facility maintenance in Alexandria, VA and the DC metro area. Book a service call, explore maintenance plans, or shop replacement parts."
        path="/"
      />
      <div className="relative font-sans overflow-hidden">
      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        variants={sectionVariants}
        animate={heroInView ? "visible" : "hidden"}
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: backgroundImage
            ? `url(${backgroundImage})`
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"></div>
        <div className="container mx-auto relative z-10 text-center px-4 sm:px-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight"
          >
            Industry-Leading{" "}
            <span className="text-primary">Facility Solutions</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-100 mb-10 max-w-3xl mx-auto font-light"
          >
            Optimize your operations with our state-of-the-art maintenance
            services.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              onClick={() => navigate("/services")}
              className="bg-primary hover:bg-primary/90 text-white py-4 px-8 rounded-full font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2"
            >
              Explore Services <ArrowRight size={20} />
            </Button>
            <Button
              onClick={() => navigate("/contact")}
              className="bg-transparent border-2 border-white hover:bg-white/10 text-white py-4 px-8 rounded-full font-semibold text-lg transition-all duration-300"
            >
              Contact Us
            </Button>
          </motion.div>
        </div>

        {/* Animated scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1 h-3 bg-white rounded-full mt-2"
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Services Snapshot */}
      <motion.section
        ref={servicesRef}
        variants={sectionVariants}
        animate={servicesInView ? "visible" : "hidden"}
        className="py-20 bg-gradient-to-b from-gray-50 to-white relative"
      >
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-white"></div>
        <div className="container mx-auto relative z-10 px-4 sm:px-6">
          <div className="text-center mb-16">
            <motion.h2
              className="text-4xl md:text-5xl font-bold mb-4 text-gray-800"
              initial={{ opacity: 0, y: 20 }}
              animate={servicesInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              Our <span className="text-primary">Services</span>
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={servicesInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Comprehensive facility solutions tailored to your specific needs
            </motion.p>
          </div>

          {loading.services && (
            <div className="flex justify-center py-10">
              <div className="animate-pulse text-gray-500">
                Loading services...
              </div>
            </div>
          )}
          {error.services && (
            <p className="text-red-500 text-center py-10">{error.services}</p>
          )}
          {!loading.services && !error.services && services.length === 0 && (
            <p className="text-gray-500 text-center py-10">No services listed yet.</p>
          )}
          {!loading.services && !error.services && services.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  variants={cardVariants}
                  custom={index}
                  initial="hidden"
                  animate={servicesInView ? "visible" : "hidden"}
                  className="h-full"
                >
                  <Tilt options={{ max: 15, scale: 1.05, speed: 500 }}>
                    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-gray-100">
                      <div className="h-48 bg-gray-100 overflow-hidden flex items-center justify-center">
                        {service.image_url ? (
                          <img
                            src={resolveMediaUrl(service.image_url)}
                            alt={service.name}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                            loading="lazy"
                          />
                        ) : (
                          <Settings className="w-16 h-16 text-primary/30" />
                        )}
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <h3 className="text-xl font-bold text-gray-800 mb-3">
                          {service.name}
                        </h3>
                        <p className="text-gray-600 mb-5 flex-grow">
                          {service.short_description}
                        </p>
                        <Button
                          onClick={() => navigate(`/services/${service.slug}`)}
                          className="bg-primary hover:bg-primary/90 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 self-start flex items-center gap-2 group"
                          aria-label={`Learn more about ${service.name}`}
                        >
                          Learn More
                          <ArrowRight
                            size={16}
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </Button>
                      </div>
                    </div>
                  </Tilt>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      {/* Why Choose Us */}
      <motion.section
        ref={whyChooseUsRef}
        variants={sectionVariants}
        animate={whyChooseUsInView ? "visible" : "hidden"}
        className="py-20 bg-gray-900 text-white"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <motion.h2
              className="text-4xl md:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={whyChooseUsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              Why <span className="text-primary">Choose Us</span>?
            </motion.h2>
            <motion.p
              className="text-xl text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={whyChooseUsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Experience the difference of working with industry leaders
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                title: "24/7 Emergency Service",
                icon: <Clock size={32} className="text-primary" />,
                description:
                  "Round-the-clock support for urgent facility issues",
              },
              {
                title: "Certified Technicians",
                icon: <Award size={32} className="text-primary" />,
                description: "Highly trained and certified professionals",
              },
              {
                title: "Preventative Maintenance",
                icon: <Shield size={32} className="text-primary" />,
                description: "Proactive solutions to prevent future problems",
              },
              {
                title: "Local & Family-Owned",
                icon: <Users size={32} className="text-primary" />,
                description: "Personalized service with community values",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                variants={cardVariants}
                custom={index}
                initial="hidden"
                animate={whyChooseUsInView ? "visible" : "hidden"}
                className="bg-gray-800 rounded-2xl p-6 text-center hover:bg-gray-700 transition-all duration-300 border border-gray-700 h-full flex flex-col items-center"
              >
                <div className="bg-gray-700 rounded-full p-4 mb-4 inline-flex">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-gray-300">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials */}
      <Testimonials />

      {/* Blog Section */}
      <motion.section
        ref={blogRef}
        variants={sectionVariants}
        animate={blogInView ? "visible" : "hidden"}
        className="py-20 bg-gradient-to-b from-white to-gray-50"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <motion.h2
              className="text-4xl md:text-5xl font-bold mb-4 text-gray-800"
              initial={{ opacity: 0, y: 20 }}
              animate={blogInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              Latest <span className="text-primary">Insights</span>
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={blogInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Stay updated with industry trends and maintenance tips
            </motion.p>
          </div>
          <BlogSection />
        </div>
      </motion.section>

      {/* CTA Section */}
      <section className="py-16 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-dark opacity-95"></div>
        <div className="container mx-auto relative z-10 text-center px-4 sm:px-6">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Ready to Optimize Your Facility?
          </motion.h2>
          <motion.p
            className="text-xl text-white mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Contact us today for a free consultation and customized solution
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Button
              onClick={() => navigate("/contact")}
              className="bg-white text-primary hover:bg-gray-100 py-3 px-8 rounded-full font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Get Started Today
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
    </>
  );
});

export default Home;
