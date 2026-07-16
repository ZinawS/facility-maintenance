const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");

/**
 * Uploaded images (services, team, parts) are stored as server-relative
 * paths like "/uploads/abc123.png" — the client and API run on different
 * origins in dev (and often in production too), so they must be resolved
 * against the API's origin rather than rendered as-is.
 */
export function resolveMediaUrl(path) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}
