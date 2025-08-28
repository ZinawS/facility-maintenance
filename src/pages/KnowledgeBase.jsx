import { motion } from "framer-motion";
import { BookOpen, Video, Phone } from "lucide-react";
import Button from "../components/UI/Button";

/**
 * KnowledgeBase component for troubleshooting guides and video tutorials
 * @returns {JSX.Element} The rendered KnowledgeBase component
 */
function KnowledgeBase() {
  const guides = [
    {
      title: "Walk-in Not Cooling? Check These 3 Things",
      steps: [
        "Inspect door gasket for proper seal",
        "Check power supply and circuit breaker",
        "Verify temperature settings",
      ],
    },
    {
      title: "How to Reset a Tripped HVAC Breaker",
      steps: [
        "Locate the breaker panel",
        "Find the HVAC circuit",
        "Reset the breaker to ON position",
      ],
    },
  ];

  const videos = [
    {
      title: "How to Clean Condenser Coils",
      url: "/assets/condenser-coil-video.mp4",
    },
    { title: "Testing Door Gasket Seal", url: "/assets/gasket-seal-video.mp4" },
  ];

  // Animation variants for section entrance
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  // Animation variants for cards
  const cardVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
    }),
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={sectionVariants}
      className="container mx-auto px-6 py-12"
      role="main"
      aria-label="Knowledge Base Page"
    >
      <h1 className="text-4xl font-extrabold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500 flex items-center justify-center space-x-2">
        <BookOpen className="w-8 h-8" />
        <span>Knowledge Base</span>
      </h1>

      <motion.section
        variants={sectionVariants}
        className="mb-12 bg-white/90 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-teal-500/20"
      >
        <h2 className="text-3xl font-semibold mb-4 text-teal-300 flex items-center space-x-2">
          <BookOpen className="w-6 h-6" />
          <span>Troubleshooting Guides</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guides.map((guide, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              custom={index}
              className="p-6 bg-white rounded-lg shadow-lg hover:shadow-teal-500/20 transition-all duration-300 border border-gray-200"
            >
              <h3 className="text-xl font-semibold text-gray-800">
                {guide.title}
              </h3>
              <ul className="list-disc mt-4 space-y-2 text-gray-600">
                {guide.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        variants={sectionVariants}
        className="mb-12 bg-white/90 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-teal-500/20"
      >
        <h2 className="text-3xl font-semibold mb-4 text-teal-300 flex items-center space-x-2">
          <Video className="w-6 h-6" />
          <span>Video Tutorials</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {videos.map((video, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              custom={index}
              className="p-6 bg-white rounded-lg shadow-lg hover:shadow-teal-500/20 transition-all duration-300 border border-gray-200"
            >
              <h3 className="text-xl font-semibold text-gray-800">
                {video.title}
              </h3>
              <video
                controls
                className="w-full h-48 mt-4 rounded"
                aria-label={video.title}
              >
                <source src={video.url} type="video/mp4" />
              </video>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section variants={sectionVariants} className="text-center">
        <p className="text-lg text-gray-700 mb-4">
          If you are uncomfortable performing these steps, or if the problem
          persists, call our professionals at{" "}
          <a
            href="tel:+18001234567"
            className="text-teal-500 hover:text-teal-600 transition-colors duration-300"
          >
            (800) 123-4567
          </a>
          .
        </p>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            href="/contact"
            className="bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-teal-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-teal-500/50"
            aria-label="Contact Us"
          >
            Contact Us
          </Button>
        </motion.div>
      </motion.section>
    </motion.div>
  );
}

export default KnowledgeBase;
