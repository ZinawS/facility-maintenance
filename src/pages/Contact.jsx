import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageCircle,
  Building,
  AlertTriangle, // Emergency alternative
} from "lucide-react";
import Button from "../components/UI/Button";
import { address } from "../utility/constant";

/**
 * Contact component for displaying contact information and a contact form
 * @returns {JSX.Element} The rendered Contact component
 */
function Contact() {
  // Animation variants for section entrance
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
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
      role="main"
      aria-label="Contact Page"
    >
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header Section */}
        <motion.section
          className="text-center mb-16"
          variants={sectionVariants}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
            Contact <span className="text-primary">Us</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get in touch with our team for expert facility solutions and support
          </p>
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Contact Information */}
          <motion.div
            variants={sectionVariants}
            className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
          >
            <div className="flex items-center mb-8">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <MessageCircle className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Get in Touch</h2>
            </div>

            <div className="space-y-6">
              {[
                {
                  icon: <Phone className="w-6 h-6 text-primary" />,
                  title: "Phone",
                  content: (
                    <a
                      href="tel:+18001234567"
                      className="hover:text-primary transition-colors duration-300"
                    >
                      (800) 123-4567
                    </a>
                  ),
                },
                {
                  icon: <AlertTriangle className="w-6 h-6 text-primary" />,
                  title: "Emergency",
                  content: (
                    <a
                      href="tel:+18009876543"
                      className="hover:text-primary transition-colors duration-300 text-red-600 font-semibold"
                    >
                      (800) 987-6543
                    </a>
                  ),
                },
                {
                  icon: <Mail className="w-6 h-6 text-primary" />,
                  title: "Email",
                  content: (
                    <a
                      href="mailto:service@onestoputilityservice.com"
                      className="hover:text-primary transition-colors duration-300"
                    >
                      service@onestoputilityservice.com
                    </a>
                  ),
                },
                {
                  icon: <MapPin className="w-6 h-6 text-primary" />,
                  title: "Address",
                  content: address,
                },
                {
                  icon: <Clock className="w-6 h-6 text-primary" />,
                  title: "Hours",
                  content: "Mon-Fri 8AM-5PM, 24/7 Emergency Service",
                },
                {
                  icon: <Building className="w-6 h-6 text-primary" />,
                  title: "Service Area",
                  content: "Chicago, Cook County, DuPage County",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  custom={index}
                  className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-300"
                >
                  <div className="bg-primary/10 p-2 rounded-lg mt-1">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {item.title}
                    </h3>
                    <p className="text-gray-600">{item.content}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            variants={sectionVariants}
            className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
          >
            <div className="flex items-center mb-8">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <Send className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Send a Message
              </h2>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    className="block text-gray-700 font-medium mb-2"
                    htmlFor="name"
                  >
                    Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 bg-gray-50"
                    required
                    aria-label="Name"
                  />
                </div>
                <div>
                  <label
                    className="block text-gray-700 font-medium mb-2"
                    htmlFor="company"
                  >
                    Company
                  </label>
                  <input
                    id="company"
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 bg-gray-50"
                    aria-label="Company"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    className="block text-gray-700 font-medium mb-2"
                    htmlFor="phone"
                  >
                    Phone *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 bg-gray-50"
                    required
                    aria-label="Phone number"
                  />
                </div>
                <div>
                  <label
                    className="block text-gray-700 font-medium mb-2"
                    htmlFor="email"
                  >
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 bg-gray-50"
                    required
                    aria-label="Email address"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="equipment"
                >
                  Equipment Type
                </label>
                <select
                  id="equipment"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 bg-gray-50"
                  aria-label="Equipment type"
                >
                  <option value="">Select Equipment Type</option>
                  <option value="hvac">HVAC System</option>
                  <option value="refrigeration">Refrigeration</option>
                  <option value="cooler">Walk-in Cooler/Freezer</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="service"
                >
                  Service Needed
                </label>
                <select
                  id="service"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 bg-gray-50"
                  aria-label="Service needed"
                >
                  <option value="">Select Service Type</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="repair">Repair</option>
                  <option value="installation">Installation</option>
                  <option value="emergency">Emergency Service</option>
                  <option value="consultation">Consultation</option>
                </select>
              </div>

              <div>
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="message"
                >
                  Message *
                </label>
                <textarea
                  id="message"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 bg-gray-50"
                  rows="5"
                  required
                  aria-label="Message"
                ></textarea>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  aria-label="Submit Contact Form"
                >
                  <Send className="w-5 h-5" />
                  Send Message
                </Button>
              </motion.div>
            </form>
          </motion.div>
        </div>

        {/* Map Section */}
        <motion.section
          variants={sectionVariants}
          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
        >
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <MapPin className="w-6 h-6 text-primary mr-3" />
              Our Location
            </h2>
          </div>
          <div className="h-96 w-full">
            <iframe
              src={mapSrc}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="One-Stop Utility Service Location Map"
              className="w-full h-full"
            />
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          variants={sectionVariants}
          className="mt-16 bg-gradient-to-r from-primary to-primary-dark rounded-3xl p-8 md:p-12 text-white text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Need Immediate Assistance?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Our emergency service team is available 24/7 to handle urgent
            facility issues.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+18009876543"
              className="bg-white text-primary hover:bg-gray-100 py-3 px-8 rounded-full font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-5 h-5" />
              Call Emergency Line
            </a>
            <button className="bg-transparent border-2 border-white hover:bg-white/10 py-3 px-8 rounded-full font-semibold text-lg transition-all duration-300">
              Schedule Service
            </button>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}

export default Contact;
