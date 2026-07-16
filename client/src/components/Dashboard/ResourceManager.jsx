import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, X } from "lucide-react";
import Button from "../UI/Button";
import Spinner from "../UI/Spinner";
import EmptyState from "../UI/EmptyState";

function emptyValues(fields) {
  const values = {};
  for (const f of fields) {
    if (f.type === "checkbox") values[f.name] = f.default ?? false;
    else if (f.type === "string-array") values[f.name] = [];
    else values[f.name] = f.default ?? "";
  }
  return values;
}

function toFormValues(item, fields) {
  const values = {};
  for (const f of fields) {
    if (f.type === "checkbox") values[f.name] = !!item[f.name];
    else if (f.type === "string-array") values[f.name] = Array.isArray(item[f.name]) ? item[f.name] : [];
    else values[f.name] = item[f.name] ?? "";
  }
  return values;
}

/**
 * Generic list/create/edit/delete admin panel for a simple content resource,
 * driven by a `fields` schema. Mirrors the server's generic resource router
 * (server/utils/resourceRouter.js) so adding a new admin-manageable content
 * type doesn't require a bespoke UI.
 */
function ResourceManager({ title, icon, api, fields, hasImage = false, renderPreview }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyValues(fields));
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await api.adminList());
      setError("");
    } catch (err) {
      setError(err.message || `Failed to load ${title.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setForm(emptyValues(fields));
    setImageFile(null);
    setEditingId(null);
    setIsFormOpen(true);
  };

  const openEdit = (item) => {
    setForm(toFormValues(item, fields));
    setImageFile(null);
    setEditingId(item.id);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (hasImage && imageFile) payload.image = imageFile;
      if (editingId) {
        await api.update(editingId, payload);
        setSuccess(`${title} updated`);
      } else {
        await api.create(payload);
        setSuccess(`${title} created`);
      }
      setIsFormOpen(false);
      setError("");
      await load();
    } catch (err) {
      setError(err.message || `Failed to save ${title.toLowerCase()}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete this ${title.toLowerCase().replace(/s$/, "")}?`)) return;
    try {
      await api.remove(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      setSuccess(`${title} deleted`);
    } catch (err) {
      setError(err.message || `Failed to delete ${title.toLowerCase()}`);
    }
  };

  const updateField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  return (
    <motion.section className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-semibold text-primary flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </h3>
        <Button
          onClick={isFormOpen ? () => setIsFormOpen(false) : openCreate}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          {isFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isFormOpen ? "Cancel" : `Add ${title.replace(/s$/, "")}`}
        </Button>
      </div>

      {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
      {success && <p className="text-green-600 mb-4 text-sm">{success}</p>}

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="space-y-4 mb-8 bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
          {fields.map((f) => (
            <div key={f.name}>
              <label className="block font-medium mb-1 text-sm text-gray-700 dark:text-gray-200">
                {f.label}
              </label>
              {f.type === "textarea" && (
                <textarea
                  value={form[f.name]}
                  onChange={(e) => updateField(f.name, e.target.value)}
                  rows={4}
                  required={f.required}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2"
                />
              )}
              {f.type === "string-array" && (
                <textarea
                  value={form[f.name].join("\n")}
                  onChange={(e) => updateField(f.name, e.target.value.split("\n").filter(Boolean))}
                  rows={4}
                  placeholder="One item per line"
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2"
                />
              )}
              {f.type === "checkbox" && (
                <input
                  type="checkbox"
                  checked={form[f.name]}
                  onChange={(e) => updateField(f.name, e.target.checked)}
                  className="w-5 h-5"
                />
              )}
              {(f.type === "text" || f.type === "number") && (
                <input
                  type={f.type}
                  value={form[f.name]}
                  onChange={(e) => updateField(f.name, e.target.value)}
                  required={f.required}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2"
                />
              )}
            </div>
          ))}
          {hasImage && (
            <div>
              <label className="block font-medium mb-1 text-sm text-gray-700 dark:text-gray-200">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full text-sm"
              />
            </div>
          )}
          <Button
            type="submit"
            disabled={saving}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold disabled:opacity-60"
          >
            {saving ? <Spinner size="sm" /> : editingId ? `Update ${title.replace(/s$/, "")}` : `Create ${title.replace(/s$/, "")}`}
          </Button>
        </form>
      )}

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState message={`No ${title.toLowerCase()} yet.`} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
            >
              {renderPreview ? renderPreview(item) : <p className="font-semibold">{item.name || item.title}</p>}
              <div className="flex gap-2 mt-3">
                <Button
                  onClick={() => openEdit(item)}
                  className="bg-secondary text-white px-3 py-1.5 rounded text-sm flex items-center gap-1"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit
                </Button>
                <Button
                  onClick={() => handleDelete(item.id)}
                  className="bg-red-600 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.section>
  );
}

export default ResourceManager;
