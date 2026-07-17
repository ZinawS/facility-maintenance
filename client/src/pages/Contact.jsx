import { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageCircle,
  Building,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import Button from "../components/UI/Button";
import Spinner from "../components/UI/Spinner";
import Seo from "../components/UI/Seo";
import apiService from "../services/api";
import useSiteSettings from "../hooks/useSiteSettings";

const EMPTY_FORM = { name: "", company: "", phone: "", email: "", equipment_type: "", message: "" };

/**
 * Contact component for displaying contact information and a contact form
 * @returns {JSX.Element} The rendered Contact component
 */
function Contact() {
  const { settings } = useSiteSettings();
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const mapSrc = settings.address
    ? `https://www.google.com/maps?q=${encodeURIComponent(settings.address)}&output=embed`
    : "";
  const telHref = (value) => `tel:${(value || "").replace(/[^\d+]/g, "")}`;

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await apiService.submitContact(form);
      setSuccess(true);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err.message || "Failed to send message");
    } finally {
      setSubmitting(false);
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" } }),
  };

  const infoItems = [
    {
      icon: <Phone className="w-6 h-6 text-primary" />,
      title: "Phone",
      content: (
        <a href={telHref(settings.phone)} className="hover:text-primary transition-colors duration-300">
          {settings.phone}
        </a>
      ),
    },
    settings.emergency_phone && {
      icon: <AlertTriangle className="w-6 h-6 text-primary" />,
      title: "Emergency",
      content: (
        <a
          href={telHref(settings.emergency_phone)}
          className="hover:text-primary transition-colors duration-300 text-red-600 font-semibold"
        >
          {settings.emergency_phone}
        </a>
      ),
    },
    {
      icon: <Mail className="w-6 h-6 text-primary" />,
      title: "Email",
      content: (
        <a href={`mailto:${settings.email}`} className="hover:text-primary transition-colors duration-300">
          {settings.email}
        </a>
      ),
    },
    { icon: <MapPin className="w-6 h-6 text-primary" />, title: "Address", content: settings.address },
    { icon: <Clock className="w-6 h-6 text-primary" />, title: "Hours", content: settings.working_hours },
  ].filter(Boolean);

  return (
    <>
      <Seo
        title="Contact Us"
        description="Get in touch with One-Stop Utility Service for a quote, emergency HVAC or refrigeration service, or general questions. Call, email, or send us a message."
        path="/contact"
      />
      <motion.div
      initial="hidden"
      animate="visible"
      variants={sectionVariants}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12"
      role="main"
      aria-label="Contact Page"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <motion.section className="text-center mb-16" variants={sectionVariants}>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
            Contact <span className="text-primary">Us</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get in touch with our team for expert facility solutions and support
          </p>
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <motion.div variants={sectionVariants} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center mb-8">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <MessageCircle className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Get in Touch</h2>
            </div>

            <div className="space-y-6">
              {infoItems.map((item, index) => (
                <motion.div
                  key={item.title}
                  variants={cardVariants}
                  custom={index}
                  className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-300"
                >
                  <div className="bg-primary/10 p-2 rounded-lg mt-1">{item.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{item.title}</h3>
                    <p className="text-gray-600">{item.content}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            id="contact-form"
            variants={sectionVariants}
            className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
          >
            <div className="flex items-center mb-8">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <Send className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Send a Message</h2>
            </div>

            {success && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-green-600 bg-green-50 p-4 rounded-lg mb-6 flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Message sent — we'll get back to you shortly.
              </motion.p>
            )}
            {error && <p className="text-red-500 bg-red-50 p-4 rounded-lg mb-6">{error}</p>}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
                    Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 bg-gray-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="company">
                    Company
                  </label>
                  <input
                    id="company"
                    type="text"
                    value={form.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 bg-gray-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="phone">
                    Phone *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 bg-gray-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 bg-gray-50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="equipment_type">
                  Equipment Type
                </label>
                <select
                  id="equipment_type"
                  value={form.equipment_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 bg-gray-50"
                >
                  <option value="">Select Equipment Type</option>
                  <option value="hvac">HVAC System</option>
                  <option value="refrigeration">Refrigeration</option>
                  <option value="cooler">Walk-in Cooler/Freezer</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="message">
                  Message *
                </label>
                <textarea
                  id="message"
                  value={form.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 bg-gray-50"
                  rows="5"
                  required
                />
              </div>

              <motion.div whileHover={{ scale: submitting ? 1 : 1.02 }} whileTap={{ scale: submitting ? 1 : 0.98 }}>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  {submitting ? <Spinner size="sm" /> : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
          </motion.div>
        </div>

        {mapSrc && (
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
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Our Location Map"
                className="w-full h-full"
              />
            </div>
          </motion.section>
        )}

        <motion.section
          variants={sectionVariants}
          className="mt-16 bg-gradient-to-r from-primary to-primary-dark rounded-3xl p-8 md:p-12 text-white text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Need Immediate Assistance?</h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Our emergency service team is available 24/7 to handle urgent facility issues.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={telHref(settings.emergency_phone || settings.phone)}
              className="bg-white text-primary hover:bg-gray-100 py-3 px-8 rounded-full font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-5 h-5" />
              Call Emergency Line
            </a>
            <a
              href="#contact-form"
              className="bg-transparent border-2 border-white hover:bg-white/10 py-3 px-8 rounded-full font-semibold text-lg transition-all duration-300"
            >
              Schedule Service
            </a>
          </div>
        </motion.section>
      </div>
    </motion.div>
    </>
  );
}

export default Contact;
