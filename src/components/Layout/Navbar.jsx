import React, { useState, useContext, useMemo, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  ChevronDown,
  Phone,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import apiService from "../../services/api";
import logo from "../../assets/images/logo.png";

const NavBar = memo(() => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
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

  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav
      initial="hidden"
      animate="visible"
      variants={navVariants}
      style={{
        backgroundOpacity,
        backdropFilter: `blur(${backdropBlur.get()}px)`,
      }}
      className="sticky top-0 z-50 text-white shadow-xl backdrop-blur-lg transition-colors duration-300 bg-gradient-to-r from-primary to-primary-dark border-b border-white/10"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <motion.a
            href="/"
            className="flex items-center space-x-3"
            aria-label="One-Stop Utility Service Home"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0],
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
                  alt="One-Stop Utility Service Logo"
                  className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
                />
              )}
            </motion.div>
            <span className="hidden sm:block text-xl font-bold">
              One-Stop Utility Service
            </span>
          </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <motion.a
                key={item.path}
                href={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 font-medium ${
                  isActive(item.path)
                    ? "bg-white/20 text-white"
                    : "text-white/90 hover:text-white hover:bg-white/10"
                }`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                aria-label={item.label}
              >
                {item.icon}
                <span>{item.label}</span>
              </motion.a>
            ))}

            {/* User Actions */}
            <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-white/20">
              {user ? (
                <>
                  <motion.a
                    href="/dashboard"
                    className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors duration-300"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Dashboard"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden xl:inline">Dashboard</span>
                  </motion.a>
                  <motion.button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-300 shadow-md"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="hidden xl:inline">Logout</span>
                  </motion.button>
                </>
              ) : (
                <motion.a
                  href="/login"
                  className="bg-white text-primary px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-md font-semibold"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Login"
                >
                  Login
                </motion.a>
              )}

              <motion.button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300"
                whileHover={{ scale: 1.1, rotate: 15 }}
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

              {/* Emergency Contact */}
              <motion.a
                href="tel:+18009876543"
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-300 shadow-md"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Emergency Contact"
              >
                <Phone className="w-5 h-5" />
                <span className="hidden xl:inline">Emergency</span>
              </motion.a>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="lg:hidden focus:outline-none focus:ring-2 focus:ring-white/30 rounded-lg p-2 bg-white/10 hover:bg-white/20 transition-all"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="lg:hidden mt-4 rounded-xl shadow-2xl p-6 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-white/10"
            >
              {navItems.map((item, index) => (
                <motion.a
                  key={item.path}
                  href={item.path}
                  custom={index}
                  variants={menuItemVariants}
                  className={`flex items-center space-x-3 py-4 text-lg font-medium transition-colors duration-300 border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                    isActive(item.path)
                      ? "text-primary dark:text-primary-light"
                      : "text-gray-800 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label={item.label}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </motion.a>
              ))}

              {/* Dropdown items in mobile */}
              {/* {dropdownItems.map((item, index) => (
                <motion.a
                  key={item.path}
                  href={item.path}
                  custom={navItems.length + index}
                  variants={menuItemVariants}
                  className="flex items-center space-x-3 py-4 text-lg font-medium text-gray-800 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light transition-colors duration-300 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label={item.label}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </motion.a>
              ))} */}

              {/* User section in mobile */}
              <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
                {user ? (
                  <>
                    <motion.a
                      href="/dashboard"
                      custom={navItems.length}
                      variants={menuItemVariants}
                      className="flex items-center space-x-3 py-4 text-lg font-medium text-gray-800 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light transition-colors duration-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                      aria-label="Dashboard"
                    >
                      <User className="w-5 h-5" />
                      <span>Dashboard</span>
                    </motion.a>
                    <motion.button
                      custom={navItems.length + 1}
                      variants={menuItemVariants}
                      onClick={handleLogout}
                      className="flex items-center space-x-3 py-4 text-lg font-medium text-red-600 hover:text-red-700 transition-colors duration-300 w-full text-left"
                      aria-label="Logout"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </motion.button>
                  </>
                ) : (
                  <motion.a
                    href="/login"
                    custom={navItems.length}
                    variants={menuItemVariants}
                    className="flex items-center space-x-3 py-4 text-lg font-medium text-primary dark:text-primary-light hover:text-primary/80 dark:hover:text-primary-light/80 transition-colors duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-label="Login"
                  >
                    <User className="w-5 h-5" />
                    <span>Login</span>
                  </motion.a>
                )}

                <motion.button
                  custom={navItems.length + (user ? 2 : 1)}
                  variants={menuItemVariants}
                  onClick={toggleTheme}
                  className="flex items-center space-x-3 py-4 text-lg font-medium text-gray-800 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light transition-colors duration-300 w-full text-left"
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

                <motion.a
                  href="tel:+18009876543"
                  custom={navItems.length + (user ? 3 : 2)}
                  variants={menuItemVariants}
                  className="flex items-center space-x-3 py-4 text-lg font-medium text-red-600 hover:text-red-700 transition-colors duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Emergency Contact"
                >
                  <Phone className="w-5 h-5" />
                  <span>Emergency Contact</span>
                </motion.a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
});

export default NavBar;
