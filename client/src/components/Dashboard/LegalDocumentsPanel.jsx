import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Scale, Save } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import apiService from "../../services/api";
import Button from "../UI/Button";
import Spinner from "../UI/Spinner";

const TYPES = [
  { key: "terms", label: "Terms & Conditions" },
  { key: "disclaimer", label: "Disclaimer" },
];

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};

function LegalDocumentsPanel() {
  const [activeType, setActiveType] = useState("terms");
  const [doc, setDoc] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = (type) => {
    setLoading(true);
    apiService
      .getLegalDocumentAdmin(type)
      .then((data) => {
        setDoc(data);
        setTitle(data.title);
        setContent(data.content);
        setError("");
      })
      .catch((err) => setError(err.message || "Failed to load document"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(activeType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeType]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await apiService.updateLegalDocument(activeType, { title, content });
      setDoc(updated);
      setSuccess(`Published as version ${updated.version}`);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to save document");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.section className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
      <h3 className="text-2xl font-semibold mb-4 text-primary flex items-center gap-2">
        <Scale className="w-6 h-6" />
        <span>Legal Documents</span>
      </h3>

      <div className="flex gap-2 mb-6">
        {TYPES.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveType(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeType === t.key ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
      {success && <p className="text-green-600 mb-4 text-sm">{success}</p>}

      {loading ? (
        <Spinner />
      ) : (
        <form onSubmit={handleSave} className="space-y-4">
          {doc && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Currently published: version {doc.version}
              {doc.published_at &&
                ` — ${new Date(doc.published_at).toLocaleString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}`}
              . Saving publishes a new version immediately and applies to future registrations — past
              acceptances stay recorded against the version a user actually agreed to.
            </p>
          )}
          <div>
            <label className="block font-medium mb-1 text-sm text-gray-700 dark:text-gray-200">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-medium mb-1 text-sm text-gray-700 dark:text-gray-200">Content</label>
            <ReactQuill theme="snow" value={content} onChange={setContent} modules={quillModules} className="bg-white" />
          </div>
          <Button
            type="submit"
            disabled={saving}
            className="bg-primary text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? "Publishing..." : "Save & Publish"}
          </Button>
        </form>
      )}
    </motion.section>
  );
}

export default LegalDocumentsPanel;
