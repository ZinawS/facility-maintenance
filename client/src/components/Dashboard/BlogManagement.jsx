import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Edit, Plus, Trash2 } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css"; // You can change theme
import apiService from "../../services/api";
import Button from "../UI/Button";
import EmptyState from "../UI/EmptyState";

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image", "code-block"],
    ["clean"],
  ],
};

function BlogManagement({ blogs, setBlogs, setSuccess, setError }) {
  const [isBlogFormOpen, setIsBlogFormOpen] = useState(false);
  const [blogForm, setBlogForm] = useState({
    id: null,
    title: "",
    content: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    Prism.highlightAll();
  }, [blogs]);

  const handleBlogSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: blogForm.title,
        content: blogForm.content,
      };

      if (isEditing) {
        await apiService.updateBlog(blogForm.id, payload);
        setBlogs(
          blogs.map((blog) =>
            blog.id === blogForm.id ? { ...blog, ...payload } : blog
          )
        );
        setSuccess("Blog updated successfully");
      } else {
        const created = await apiService.createBlog(payload);
        setBlogs([
          ...blogs,
          {
            id: created.id,
            ...payload,
            author: "Admin",
            created_at: new Date(),
          },
        ]);
        setSuccess("Blog created successfully");
      }

      setError("");
      setBlogForm({ id: null, title: "", content: "" });
      setIsBlogFormOpen(false);
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Failed to save blog");
      setSuccess("");
    }
  };

  const handleEditBlog = (blog) => {
    setBlogForm({ id: blog.id, title: blog.title, content: blog.content });
    setIsEditing(true);
    setIsBlogFormOpen(true);
  };

  const handleDeleteBlog = async (blog) => {
    if (!window.confirm(`Delete "${blog.title}"? This can't be undone.`)) return;
    try {
      await apiService.deleteBlog(blog.id);
      setBlogs(blogs.filter((b) => b.id !== blog.id));
      setSuccess("Blog deleted successfully");
      setError("");
    } catch (err) {
      setError(err.message || "Failed to delete blog");
      setSuccess("");
    }
  };

  return (
    <motion.section className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <h3 className="text-2xl font-semibold mb-4 text-teal-600 flex items-center space-x-2">
        <FileText className="w-6 h-6" />
        <span>Blog Posts</span>
      </h3>

      <Button
        onClick={() => {
          setBlogForm({ id: null, title: "", content: "" });
          setIsEditing(false);
          setIsBlogFormOpen(true);
        }}
        className="mb-6 bg-teal-500 text-white px-4 py-2 rounded-lg"
      >
        <Plus className="w-5 h-5 mr-2" />
        Create New Post
      </Button>

      {isBlogFormOpen && (
        <form onSubmit={handleBlogSubmit} className="space-y-6 mb-6">
          <div>
            <label htmlFor="title" className="block font-medium mb-2">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={blogForm.title}
              onChange={(e) =>
                setBlogForm({ ...blogForm, title: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              required
            />
          </div>
          <div>
            <label htmlFor="content" className="block font-medium mb-2">
              Content
            </label>
            <ReactQuill
              theme="snow"
              value={blogForm.content}
              onChange={(value) => setBlogForm({ ...blogForm, content: value })}
              modules={quillModules}
              className="bg-white rounded-lg"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-teal-500 text-white py-3 rounded-lg font-semibold"
          >
            {isEditing ? "Update Blog" : "Create Blog"}
          </Button>
        </form>
      )}

      {blogs.length === 0 && <EmptyState message="No blog posts yet." />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <motion.div
            key={blog.id}
            className="p-6 bg-white rounded-lg shadow-md border border-gray-200"
          >
            <p className="text-lg font-semibold mb-2">{blog.title}</p>
            <div
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => handleEditBlog(blog)}
                className="bg-teal-500 text-white px-4 py-2 rounded-lg"
              >
                <Edit className="w-5 h-5 mr-2" />
                Edit
              </Button>
              <Button
                onClick={() => handleDeleteBlog(blog)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Delete
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

export default BlogManagement;
