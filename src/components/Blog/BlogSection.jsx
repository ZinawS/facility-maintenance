import React, { useState, useEffect,useRef } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { BookOpen, AlertCircle } from "lucide-react";
import apiService from "../../services/api";
import Button from "../UI/Button";

// Define staticBlogs locally to avoid circular dependency
const staticBlogs = [
  {
    id: "100",
    title: "Top 5 HVAC Maintenance Tips",
    content:
      "Learn how to keep your HVAC system running smoothly with these expert tips.",
    author: "Admin",
    created_at: "2025-08-01T10:00:00Z",
  },
  {
    id: "102",
    title: "Why Regular Refrigeration Maintenance Matters",
    content:
      "Discover the benefits of routine maintenance for your commercial refrigeration systems.",
    author: "Admin",
    created_at: "2025-07-15T12:00:00Z",
  },
  {
    id: "103",
    title: "Case Study: Saving Costs with Preventive Maintenance",
    content: "See how FacilityPro helped a restaurant save thousands annually.",
    author: "Admin",
    created_at: "2025-06-30T09:00:00Z",
  },
  {
    id: "104",
    title: "Energy Efficiency in Commercial Cooling",
    content: "Tips to reduce energy costs with efficient cooling systems.",
    author: "Admin",
    created_at: "2025-06-15T14:00:00Z",
  },
];

function BlogSection({ limit = 3 }) {
  const [allBlogs, setAllBlogs] = useState([]);
  const [visibleCount, setVisibleCount] = useState(limit);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedBlogs, setExpandedBlogs] = useState({});
  const contentRefs = useRef({});

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await apiService.getPublicBlogs();
        console.log("Fetched blogs:", data);

        let combinedBlogs = [...data];
        if (data.length < limit) {
          const existingIds = new Set(data.map((blog) => blog.id));
          const additionalBlogs = staticBlogs
            .filter((blog) => !existingIds.has(blog.id))
            .slice(0, limit - data.length);
          combinedBlogs = [...data, ...additionalBlogs];
        }

        setAllBlogs(combinedBlogs);
        setError("");
      } catch (err) {
        console.error("Blog fetch error:", err);
        setAllBlogs([...staticBlogs]);
        setError(err.message || "Failed to fetch blogs");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [limit]);

  // Check for overflow to determine if "Read More" should be shown
  useEffect(() => {
    const checkOverflow = () => {
      const overflowStates = {};
      Object.keys(contentRefs.current).forEach((blogId) => {
        const element = contentRefs.current[blogId];
        if (element) {
          const isOverflowing = element.scrollHeight > element.clientHeight;
          overflowStates[blogId] = isOverflowing;
        }
      });
      console.log("Overflow states:", overflowStates); // Debug overflow
    };

    // Run after render to check overflow
    const timer = setTimeout(checkOverflow, 0); // Delay to ensure DOM is rendered
    return () => clearTimeout(timer);
  }, [allBlogs, visibleCount, expandedBlogs]);

  const toggleVisibleCount = () => {
    setVisibleCount((prev) => {
      const newCount = prev === limit ? allBlogs.length : limit;
      console.log(
        "Toggling visibleCount:",
        prev,
        "->",
        newCount,
        "allBlogs.length:",
        allBlogs.length
      );
      return newCount;
    });
  };

  const toggleBlogContent = (blogId) => {
    setExpandedBlogs((prev) => ({
      ...prev,
      [blogId]: !prev[blogId],
    }));
    console.log(`Toggling blog ${blogId}:`, !expandedBlogs[blogId]); // Debug toggle
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
    }),
  };

  const visibleBlogs = allBlogs.slice(0, visibleCount);

  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      className="py-12 bg-gray-100"
      role="region"
      aria-label="Recent Blogs"
    >
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-semibold mb-8 flex items-center justify-center space-x-2 text-primary">
          <BookOpen className="w-6 h-6" />
          <span>Recent Blogs</span>
        </h2>

        {loading && <p className="text-gray-700">Loading blogs...</p>}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 mb-4 flex items-center justify-center space-x-2"
          >
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </motion.p>
        )}
        {!loading && !error && visibleBlogs.length === 0 && (
          <p className="text-gray-700">No blogs available.</p>
        )}
        {!loading && !error && visibleBlogs.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {visibleBlogs.map((blog, index) => (
                <motion.div
                  key={blog.id}
                  variants={cardVariants}
                  custom={index}
                  className="p-6 bg-white rounded-lg shadow-md hover:shadow-primary/20 transition-all duration-300"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {blog.title}
                  </h3>
                  <p
                    ref={(el) => (contentRefs.current[blog.id] = el)}
                    className={`text-gray-700 mb-4 ${
                      expandedBlogs[blog.id] ? "" : "line-clamp-3"
                    }`}
                  >
                    {blog.content}
                  </p>
                  {contentRefs.current[blog.id]?.scrollHeight >
                    contentRefs.current[blog.id]?.clientHeight && (
                    <Button
                      onClick={() => toggleBlogContent(blog.id)}
                      className="bg-primary text-white py-2 px-4 rounded-lg font-semibold hover:bg-primary/80 transition-all duration-300"
                      aria-label={
                        expandedBlogs[blog.id]
                          ? `Read less about ${blog.title}`
                          : `Read more about ${blog.title}`
                      }
                    >
                      {expandedBlogs[blog.id] ? "Read Less" : "Read More"}
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>

            {allBlogs.length > limit && (
              <Button
                onClick={toggleVisibleCount}
                className="bg-secondary text-white py-2 px-6 rounded-lg font-semibold hover:bg-secondary/80 transition-all duration-300"
              >
                {visibleCount === limit ? "Show More" : "Show Less"}
              </Button>
            )}
          </>
        )}
      </div>
    </motion.section>
  );
}

export default BlogSection;
