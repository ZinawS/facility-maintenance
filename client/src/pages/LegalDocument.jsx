import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import apiService from "../services/api";
import Spinner from "../components/UI/Spinner";

const TYPE_META = {
  terms: "Terms & Conditions",
  disclaimer: "Disclaimer",
};

/**
 * Renders whichever admin-managed legal document matches the :type route
 * param (terms/disclaimer) — see server/routes/legal.js.
 */
function LegalDocument() {
  const { type } = useParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    apiService
      .getLegalDocument(type)
      .then(setDoc)
      .catch((err) => setError(err.message || "Failed to load document"))
      .finally(() => setLoading(false));
  }, [type]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-[60vh] container mx-auto px-6 py-12 max-w-3xl"
    >
      <h1 className="text-4xl font-bold mb-8 text-gray-800 flex items-center gap-3">
        <FileText className="w-8 h-8 text-primary" />
        {doc?.title || TYPE_META[type] || "Legal Document"}
      </h1>

      {loading && <Spinner size="lg" />}
      {error && <p className="text-red-500">{error}</p>}
      {doc && (
        <>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: doc.content }} />
          <p className="text-sm text-gray-400 mt-10 border-t pt-4">
            Version {doc.version} — last updated{" "}
            {new Date(doc.published_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </>
      )}
    </motion.div>
  );
}

export default LegalDocument;
