import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Newspaper, ArrowLeft } from "lucide-react";
import apiService from "../services/api";
import Spinner from "../components/UI/Spinner";
import Seo from "../components/UI/Seo";

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

/**
 * Single blog post. /api/public/blogs has no per-post endpoint, so this
 * reuses the (small, capped-at-6) list response and finds the match —
 * simpler than adding a new route for a handful of posts.
 */
function BlogDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiService
      .getPublicBlogs()
      .then((posts) => {
        const match = posts.find((p) => String(p.id) === id);
        if (!match) {
          setError("Post not found");
        } else {
          setPost(match);
        }
      })
      .catch((err) => setError(err.message || "Failed to load post"))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <>
      <Seo
        title={post?.title || "Blog"}
        description={post ? `${post.content.slice(0, 155).trim()}…` : undefined}
        path={`/blog/${id}`}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-6 py-12 min-h-[60vh] max-w-3xl"
        role="main"
        aria-label="Blog Post"
      >
        <Link
          to="/blog"
          className="text-primary font-medium inline-flex items-center gap-1 hover:underline mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        {loading && <Spinner size="lg" />}
        {error && <p className="text-red-500">{error}</p>}

        {post && (
          <article>
            <h1 className="text-4xl font-bold mb-3 text-gray-800 dark:text-white flex items-center gap-3">
              <Newspaper className="w-8 h-8 text-primary flex-shrink-0" />
              {post.title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              {post.author} · {formatDate(post.created_at)}
            </p>
            <div className="prose dark:prose-invert max-w-none whitespace-pre-line text-gray-700 dark:text-gray-200">
              {post.content}
            </div>
          </article>
        )}
      </motion.div>
    </>
  );
}

export default BlogDetail;
