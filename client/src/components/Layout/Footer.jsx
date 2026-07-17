import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Wrench,
  Store,
  HelpCircle,
} from "lucide-react";
import { Link } from "react-router-dom"
import useSiteSettings from "../../hooks/useSiteSettings"

/**
 * Footer component for One-Stop Utility Service application
 * @returns {JSX.Element} The rendered Footer component
 */
function Footer() {
  const { settings } = useSiteSettings();
  const telHref = (value) => `tel:${(value || "").replace(/[^\d+]/g, "")}`;

  // Animation variants for footer entrance
  const footerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  // Animation variants for individual items
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
    }),
  };

  // Streamlined quick links with icons
  const quickLinks = [
    {
      path: "/services",
      label: "Services",
      icon: <Wrench className="w-5 h-5" />,
    },
    { path: "/contact", label: "Contact", icon: <Mail className="w-5 h-5" /> },
    {
      path: "/parts",
      label: "Parts Store",
      icon: <Store className="w-5 h-5" />,
    },
    { path: "/faq", label: "FAQ", icon: <HelpCircle className="w-5 h-5" /> },
  ];

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={footerVariants}
      className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 text-white py-12 relative overflow-hidden border-t border-teal-500/20"
      role="contentinfo"
      aria-label="Footer"
    >
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* About Section */}
        <motion.div variants={itemVariants} custom={0}>
          <h3 className="text-2xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500 animate-gradient">
            One-Stop Utility Service
          </h3>
          <p className="text-gray-200 leading-relaxed text-base">
            Providing reliable maintenance for your commercial facilities with
            unparalleled expertise and 24/7 support.
          </p>
        </motion.div>

        {/* Quick Links Section */}
        <motion.div variants={itemVariants} custom={1}>
          <h3 className="text-2xl font-extrabold mb-4 text-teal-300">
            Quick Links
          </h3>
          <ul className="space-y-3">
            {quickLinks.map((link, index) => (
              <motion.li
                key={link.path}
                variants={itemVariants}
                custom={index + 2}
              >
                <Link 
                  to={link.path}
                  className="flex items-center space-x-2 text-lg font-medium text-gray-200 hover:text-teal-300 transition-colors duration-300 relative group"
                  aria-label={link.label}
                >
                  {link.icon}
                  <span>{link.label}</span>
                  <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-teal-300 transition-all duration-500 group-hover:w-full"></span>
                </Link>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Contact Section */}
        <motion.div variants={itemVariants} custom={quickLinks.length + 2}>
          <h3 className="text-2xl font-extrabold mb-4 text-teal-300">
            Contact Us
          </h3>
          <ul className="space-y-3 text-gray-200 text-base">
            <motion.li
              variants={itemVariants}
              custom={quickLinks.length + 3}
              className="flex items-center space-x-2"
            >
              <Phone className="w-5 h-5 text-teal-300" />
              <p>
                Phone:{" "}
                <a href={telHref(settings.phone)} className="hover:text-teal-300 transition-colors duration-300">
                  {settings.phone}
                </a>
              </p>
            </motion.li>
            {settings.emergency_phone && (
              <motion.li
                variants={itemVariants}
                custom={quickLinks.length + 4}
                className="flex items-center space-x-2"
              >
                <Phone className="w-5 h-5 text-teal-300" />
                <p>
                  Emergency:{" "}
                  <a
                    href={telHref(settings.emergency_phone)}
                    className="hover:text-teal-300 transition-colors duration-300"
                  >
                    {settings.emergency_phone}
                  </a>
                </p>
              </motion.li>
            )}
            <motion.li
              variants={itemVariants}
              custom={quickLinks.length + 5}
              className="flex items-center space-x-2"
            >
              <Mail className="w-5 h-5 text-teal-300" />
              <p>
                Email:{" "}
                <a href={`mailto:${settings.email}`} className="hover:text-teal-300 transition-colors duration-300">
                  {settings.email}
                </a>
              </p>
            </motion.li>
            <motion.li
              variants={itemVariants}
              custom={quickLinks.length + 6}
              className="flex items-center space-x-2"
            >
              <MapPin className="w-5 h-5 text-teal-300" />
              <p>{settings.address}</p>
            </motion.li>
            <motion.li
              variants={itemVariants}
              custom={quickLinks.length + 7}
              className="flex items-center space-x-2"
            >
              <Clock className="w-5 h-5 text-teal-300" />
              <p>{settings.working_hours}</p>
            </motion.li>
          </ul>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <motion.div
        variants={itemVariants}
        custom={quickLinks.length + 8}
        className="text-center mt-12 border-t border-teal-500/30 pt-6"
      >
        <p className="text-gray-300 text-sm mb-2">
          &copy; {new Date().getFullYear()} One-Stop Utility Service. All rights reserved.
        </p>
        <p className="text-sm space-x-4">
          <Link to="/legal/terms" className="text-gray-400 hover:text-teal-300 transition-colors duration-300">
            Terms &amp; Conditions
          </Link>
          <Link to="/legal/disclaimer" className="text-gray-400 hover:text-teal-300 transition-colors duration-300">
            Disclaimer
          </Link>
        </p>
      </motion.div>

      {/* Decorative Background Element */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-blue-500/10 opacity-50 pointer-events-none"></div>
    </motion.footer>
  );
}

export default Footer;
