
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

/**
 * Dropdown component for additional navigation links
 * @param {Object} props - Component props
 * @param {Array<{path: string, label: string}>} props.items - Dropdown items
 * @returns {JSX.Element} Dropdown menu
 */
const Dropdown = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 text-gray-100 hover:text-primary transition-colors duration-300"
        aria-label="More options"
      >
        <span>More</span>
        <ChevronDown className="w-5 h-5" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={dropdownVariants}
            className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg border border-gray-200"
          >
            {items.map((item, index) => (
              <motion.li
                key={item.path}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.2 }}
              >
                <a
                  href={item.path}
                  className="block px-4 py-2 hover:bg-primary hover:text-white transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                  aria-label={item.label}
                >
                  {item.label}
                </a>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dropdown;
