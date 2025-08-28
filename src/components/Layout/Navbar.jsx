import React, { useState, useContext, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  Menu,
  X,
  User,
  Home,
  Wrench,
  Store,
  Mail,
  LogOut,
  Info,
  Sun,
  Moon,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
// import Dropdown from "../UI/Dropdown";
import apiService from "../../services/api";
import logo from "../../assets/images/logo.png";

const NavBar = memo(() => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const { scrollY } = useScroll();
  const backgroundOpacity = useTransform(scrollY, [0, 100], [0.85, 1]);
  const backdropBlur = useTransform(scrollY, [0, 100], [4, 8]);

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogout = () => {
    apiService.logout();
    setUser(null);
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  const navItems = useMemo(
    () => [
      { path: "/", label: "Home", icon: <Home className="w-5 h-5" /> },
      { path: "/about", label: "About", icon: <Info className="w-5 h-5" /> },
      {
        path: "/services",
        label: "Services",
        icon: <Wrench className="w-5 h-5" />,
      },
      {
        path: "/parts",
        label: "Parts Store",
        icon: <Store className="w-5 h-5" />,
      },
      {
        path: "/contact",
        label: "Contact",
        icon: <Mail className="w-5 h-5" />,
      },
    ],
    []
  );

  const dropdownItems = useMemo(
    () => [
      { path: "/testimonials", label: "Testimonials" },
      { path: "/faq", label: "FAQ" },
      { path: "/service-plans", label: "Service Plans" },
    ],
    []
  );

  const navVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, x: "100%" },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: "easeInOut" },
    },
    exit: {
      opacity: 0,
      x: "100%",
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  const menuItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.3, ease: "easeOut" },
    }),
  };

  return (
    <motion.nav
      initial="hidden"
      animate="visible"
      variants={navVariants}
      style={{
        backgroundOpacity,
        backdropFilter: `blur(${backdropBlur.get()}px)`,
      }}
      className={`sticky top-0 z-50 text-white shadow-xl backdrop-blur-lg transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-r from-gray-900 to-indigo-900"
          : "bg-gradient-to-r from-blue-600 to-indigo-600"
      } border-b border-white/10`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <a
            href="/"
            className="flex items-center space-x-3"
            aria-label="One-Stop Utility Service Home"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="flex items-center justify-center"
            >
              {logo && (
                <img
                  src={logo}
                  alt="logo"
                  className="w-16 h-16 sm:w-16 sm:h-16 md:w-16 md:h-16 lg:w-16 lg:h-16 object-contain"
                />
              )}
            </motion.div>
          </a>
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <motion.a
                key={item.path}
                href={item.path}
                className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors duration-300 font-medium"
                whileHover={{ y: -3, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={item.label}
              >
                {item.icon}
                <span>{item.label}</span>
              </motion.a>
            ))}
            {/* <Dropdown
              items={dropdownItems}
              className="text-white/90 hover:text-white"
            /> */}
            {user ? (
              <div className="flex items-center space-x-6">
                <motion.a
                  href="/dashboard"
                  className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors duration-300"
                  whileHover={{ y: -3, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Dashboard"
                >
                  <User className="w-5 h-5" />
                  <span>Dashboard</span>
                </motion.a>
                <motion.button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-all duration-300 shadow-md"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </motion.button>
              </div>
            ) : (
              <motion.a
                href="/login"
                className="bg-indigo-500 text-white px-4 py-2 rounded-full hover:bg-indigo-600 transition-all duration-300 shadow-md"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
                }}
                whileTap={{ scale: 0.95 }}
                aria-label="Login"
              >
                Login
              </motion.a>
            )}
            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label={
                isDarkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </motion.button>
          </div>
          <motion.button
            className="lg:hidden focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-md p-2"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isMobileMenuOpen ? (
              <X className="w-8 h-8 text-white" />
            ) : (
              <Menu className="w-8 h-8 text-white" />
            )}
          </motion.button>
        </div>
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className={`lg:hidden mt-4 rounded-lg shadow-2xl p-6 ${
                isDarkMode ? "bg-gray-800/95" : "bg-white/95"
              } backdrop-blur-md border border-white/10`}
            >
              {navItems.map((item, index) => (
                <motion.a
                  key={item.path}
                  href={item.path}
                  custom={index}
                  variants={menuItemVariants}
                  className="flex items-center space-x-3 py-3 text-lg font-medium text-gray-800 dark:text-gray-100 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label={item.label}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </motion.a>
              ))}
              {dropdownItems.map((item, index) => (
                <motion.a
                  key={item.path}
                  href={item.path}
                  custom={navItems.length + index}
                  variants={menuItemVariants}
                  className="flex items-center space-x-3 py-3 text-lg font-medium text-gray-800 dark:text-gray-100 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label={item.label}
                >
                  <span>{item.label}</span>
                </motion.a>
              ))}
              {user ? (
                <>
                  <motion.a
                    href="/dashboard"
                    custom={navItems.length + dropdownItems.length}
                    variants={menuItemVariants}
                    className="flex items-center space-x-3 py-3 text-lg font-medium text-gray-800 dark:text-gray-100 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-label="Dashboard"
                  >
                    <User className="w-5 h-5" />
                    <span>Dashboard</span>
                  </motion.a>
                  <motion.button
                    custom={navItems.length + dropdownItems.length + 1}
                    variants={menuItemVariants}
                    onClick={handleLogout}
                    className="flex items-center space-x-3 py-3 text-lg font-medium text-red-600 hover:text-red-700 transition-colors duration-300"
                    aria-label="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </motion.button>
                </>
              ) : (
                <motion.a
                  href="/login"
                  custom={navItems.length + dropdownItems.length}
                  variants={menuItemVariants}
                  className="flex items-center space-x-3 py-3 text-lg font-medium text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-500 transition-colors duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Login"
                >
                  <User className="w-5 h-5" />
                  <span>Login</span>
                </motion.a>
              )}
              <motion.button
                custom={navItems.length + dropdownItems.length + (user ? 2 : 1)}
                variants={menuItemVariants}
                onClick={toggleTheme}
                className="flex items-center space-x-3 py-3 text-lg font-medium text-gray-800 dark:text-gray-100 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-300"
                aria-label={
                  isDarkMode ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
                <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
});

export default NavBar;
