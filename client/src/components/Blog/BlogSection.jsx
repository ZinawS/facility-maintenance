import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { BookOpen, AlertCircle } from "lucide-react";
import apiService from "../../services/api";
import Button from "../UI/Button";
import Spinner from "../UI/Spinner";
import EmptyState from "../UI/EmptyState";

function BlogSection({ limit = 3 }) {
  const [allBlogs, setAllBlogs] = useState([]);
  const [visibleCount, setVisibleCount] = useState(limit);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedBlogs, setExpandedBlogs] = useState({});
  const contentRefs = useRef({});

  useEffect(() => {
    let active = true;
    setLoading(true);
    apiService
      .getPublicBlogs()
      .then((data) => {
        if (active) setAllBlogs(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Blog fetch error:", err);
        if (active) setError(err.message || "Failed to fetch blogs");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [limit]);

  const toggleVisibleCount = () => {
    setVisibleCount((prev) => (prev === limit ? allBlogs.length : limit));
  };

  const toggleBlogContent = (blogId) => {
    setExpandedBlogs((prev) => ({ ...prev, [blogId]: !prev[blogId] }));
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const cardVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" } }),
  };

  const visibleBlogs = allBlogs.slice(0, visibleCount);

  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      className="py-12 bg-gray-100 dark:bg-gray-900"
      role="region"
      aria-label="Recent Blogs"
    >
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-semibold mb-8 flex items-center justify-center space-x-2 text-primary">
          <BookOpen className="w-6 h-6" />
          <span>Recent Blogs</span>
        </h2>

        {loading && <Spinner />}
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
        {!loading && !error && visibleBlogs.length === 0 && <EmptyState message="No blogs published yet." />}
        {!loading && !error && visibleBlogs.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {visibleBlogs.map((blog, index) => (
                <motion.div
                  key={blog.id}
                  variants={cardVariants}
                  custom={index}
                  className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-primary/20 transition-all duration-300 text-left"
                >
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{blog.title}</h3>
                  <div
                    ref={(el) => (contentRefs.current[blog.id] = el)}
                    className={`prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 mb-4 ${
                      expandedBlogs[blog.id] ? "" : "line-clamp-3"
                    }`}
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                  />
                  <Button
                    onClick={() => toggleBlogContent(blog.id)}
                    className="bg-primary text-white py-2 px-4 rounded-lg font-semibold hover:bg-primary/80 transition-all duration-300"
                    aria-label={expandedBlogs[blog.id] ? `Read less about ${blog.title}` : `Read more about ${blog.title}`}
                  >
                    {expandedBlogs[blog.id] ? "Read Less" : "Read More"}
                  </Button>
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

BlogSection.propTypes = {
  limit: PropTypes.number,
};

export default BlogSection;
