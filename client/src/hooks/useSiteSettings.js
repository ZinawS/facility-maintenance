import { useEffect, useState } from "react";
import apiService from "../services/api";

const FALLBACK = { address: "", email: "", phone: "", working_hours: "", emergency_phone: "" };

/** Site contact info, admin-managed via /api/admin/settings. */
export default function useSiteSettings() {
  const [settings, setSettings] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiService
      .getSiteSettings()
      .then((data) => {
        if (active) setSettings({ ...FALLBACK, ...data });
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { settings, loading };
}
