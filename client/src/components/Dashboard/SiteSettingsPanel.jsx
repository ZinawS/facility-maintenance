import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon } from "lucide-react";
import apiService from "../../services/api";
import Button from "../UI/Button";
import Spinner from "../UI/Spinner";

const FIELDS = [
  { name: "address", label: "Business Address" },
  { name: "email", label: "Contact Email" },
  { name: "phone", label: "Phone Number" },
  { name: "emergency_phone", label: "Emergency Phone (optional)" },
  { name: "working_hours", label: "Working Hours" },
];

function SiteSettingsPanel() {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    apiService
      .getSettingsAdmin()
      .then((rows) => setForm(Object.fromEntries(rows.map((r) => [r.setting_key, r.setting_value]))))
      .catch((err) => setError(err.message || "Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiService.updateSettings(form);
      setSuccess("Settings updated");
      setError("");
    } catch (err) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.section className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
      <h3 className="text-2xl font-semibold mb-4 text-primary flex items-center gap-2">
        <SettingsIcon className="w-6 h-6" />
        <span>Site Settings</span>
      </h3>
      {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
      {success && <p className="text-green-600 mb-4 text-sm">{success}</p>}
      {loading ? (
        <Spinner />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
          {FIELDS.map((f) => (
            <div key={f.name}>
              <label className="block font-medium mb-1 text-sm text-gray-700 dark:text-gray-200">
                {f.label}
              </label>
              <input
                type="text"
                value={form[f.name] || ""}
                onChange={(e) => setForm((prev) => ({ ...prev, [f.name]: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white rounded-lg px-3 py-2"
              />
            </div>
          ))}
          <Button
            type="submit"
            disabled={saving}
            className="bg-primary text-white px-6 py-2.5 rounded-lg font-semibold disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </form>
      )}
    </motion.section>
  );
}

export default SiteSettingsPanel;
