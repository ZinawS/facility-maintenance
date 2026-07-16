import { motion } from "framer-motion";
import { Info, Users, Heart, Target, Globe, Award } from "lucide-react";
import { teamMembers } from "../utility/TeamMembers";
import culture from "../assets/images/culture.png"
import teamWork from "../assets/images/teamWork.png"

/**
 * About component for displaying company information
 * @returns {JSX.Element} The rendered About component
 */
function About() {
  // Animation variants for section entrance
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
      aria-label="About Page"
    >
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header Section */}
        <motion.section
          className="text-center mb-16"
          variants={sectionVariants}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
            About{" "}
            <span className="text-primary">One-Stop Utility Services</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Delivering exceptional facility solutions with expertise,
            dedication, and innovation since 2005
          </p>
        </motion.section>

        {/* Our Story */}
        <motion.section
          variants={sectionVariants}
          className="mb-16 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
        >
          <div>
            <div className="flex items-center mb-6">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <Info className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Our Story</h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Founded in 2005, One-Stop Utility Services was born from a passion
              for keeping businesses running smoothly. Our mission is to provide
              reliable, expert maintenance services that ensure your equipment
              performs at its best, minimizing downtime and costs.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800">19+ Years</h3>
                <p className="text-gray-600">Of Excellence</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800">500+</h3>
                <p className="text-gray-600">Clients Served</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl overflow-hidden h-80 lg:h-full">
            <img
              src={teamWork}
              alt="Our team at work"
              className="w-full h-full object-cover opacity-90"
            />
          </div>
        </motion.section>

        {/* Mission and Values */}
        <motion.section variants={sectionVariants} className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
              Our <span className="text-primary">Mission & Values</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Guiding principles that define who we are and how we operate
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: <Target className="w-8 h-8 text-primary" />,
                title: "Our Mission",
                description:
                  "To provide reliable, expert maintenance services that ensure optimal equipment performance.",
              },
              {
                icon: <Heart className="w-8 h-8 text-primary" />,
                title: "Our Values",
                description:
                  "Excellence, integrity, and customer satisfaction at the core of everything we do.",
              },
              {
                icon: <Globe className="w-8 h-8 text-primary" />,
                title: "Our Vision",
                description:
                  "To be the leading facility solutions provider known for innovation and reliability.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                variants={cardVariants}
                custom={index}
                className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 h-full flex flex-col items-center"
              >
                <div className="bg-primary/10 rounded-full p-4 mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 flex-grow">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Team Introduction */}
        <motion.section variants={sectionVariants} className="mb-16">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                Meet Our Team
              </h2>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Dedicated professionals committed to your facility's success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                variants={cardVariants}
                custom={index}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-gray-100"
              >
                <div className="h-60 bg-gray-100 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-primary font-semibold mb-4">
                    {member.role}
                  </p>
                  <p className="text-gray-600 mb-4 flex-grow">{member.bio}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Award size={16} className="mr-1 text-primary" />
                    <span>NATE Certified</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Company Culture */}
        <motion.section
          variants={sectionVariants}
          className="mb-16 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
        >
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl overflow-hidden h-80 lg:h-full">
            <img
              src={culture}
              alt="Our company culture"
              className="w-full h-full object-cover opacity-90"
            />
          </div>
          <div>
            <div className="flex items-center mb-6">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Our Culture</h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              At One-Stop Utility Services, we foster a culture of excellence,
              teamwork, and continuous learning. Our technicians are empowered
              to grow their skills, ensuring top-notch service for our clients.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800">Teamwork</h3>
                <p className="text-gray-600">Collaborative approach</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800">Growth</h3>
                <p className="text-gray-600">Continuous learning</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Community Involvement */}
        <motion.section
          variants={sectionVariants}
          className="bg-gradient-to-r from-primary to-primary-dark rounded-3xl p-8 md:p-12 text-white"
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold">Community Involvement</h2>
            </div>
            <p className="text-xl mb-8 opacity-90">
              We're proud to support local charities and sponsor community
              events in Virginia and other states, building stronger connections with the
              businesses we serve.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
              {[
                { value: "15+", label: "Local Events Sponsored" },
                { value: "5", label: "Charities Supported" },
                { value: "1000+", label: "Community Hours" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm"
                >
                  <div className="text-3xl font-bold mb-2">{item.value}</div>
                  <div className="text-white/80">{item.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}

export default About;
