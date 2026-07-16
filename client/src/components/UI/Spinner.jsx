const SIZES = { sm: "w-4 h-4 border-2", md: "w-8 h-8 border-2", lg: "w-12 h-12 border-4" };

/**
 * Inline loading indicator. Use inside buttons (size="sm") or as a
 * standalone loading state for a section (default size="md").
 */
function Spinner({ size = "md", className = "" }) {
  return (
    <div className={`flex justify-center items-center py-4 ${className}`} role="status" aria-label="Loading">
      <div
        className={`${SIZES[size]} rounded-full border-primary/20 border-t-primary animate-spin`}
      />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export default Spinner;
