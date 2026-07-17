import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Newspaper, ArrowRight } from "lucide-react";
import apiService from "../services/api";
import Spinner from "../components/UI/Spinner";
import EmptyState from "../components/UI/EmptyState";
import Seo from "../components/UI/Seo";

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

const excerpt = (text, length = 220) =>
  text.length <= length ? text : `${text.slice(0, length).trim()}…`;

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" } }),
};

/**
 * Blog listing, backed by the admin-managed /api/public/blogs resource.
 */
function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiService
      .getPublicBlogs()
      .then(setPosts)
      .catch((err) => setError(err.message || "Failed to load blog posts"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Seo
        title="Blog"
        description="HVAC and refrigeration maintenance tips, guides, and industry insights from the One-Stop Utility Service team."
        path="/blog"
      />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="container mx-auto px-6 py-12 min-h-[60vh]"
        role="main"
        aria-label="Blog Page"
      >
        <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-800 dark:text-white flex items-center justify-center space-x-2">
          <Newspaper className="w-8 h-8 text-primary" />
          <span>Blog</span>
        </h1>

        {loading && <Spinner size="lg" />}
        {error && <p className="text-red-500 text-center mb-8">{error}</p>}

        {!loading && !error && (
          posts.length === 0 ? (
            <EmptyState message="No posts published yet. Check back soon." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {posts.map((post, index) => (
                <motion.article
                  key={post.id}
                  variants={cardVariants}
                  custom={index}
                  className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-primary/20 transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col"
                >
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{post.title}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {post.author} · {formatDate(post.created_at)}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow whitespace-pre-line">
                    {excerpt(post.content)}
                  </p>
                  <Link
                    to={`/blog/${post.id}`}
                    className="text-primary font-medium inline-flex items-center gap-1 hover:underline mt-auto"
                  >
                    Read more <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.article>
              ))}
            </div>
          )
        )}
      </motion.div>
    </>
  );
}

export default Blog;
