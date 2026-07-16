/**
 * Button component for reusable button UI
 * @param {Object} props - Component props
 * @param {string} [props.type="button"] - Button type (button, submit, etc.)
 * @param {string} [props.className] - Additional CSS classes
 * @param {Function} [props.onClick] - Click handler
 * @param {string} [props.ariaLabel] - ARIA label for accessibility
 * @param {boolean} [props.disabled=false] - Disable button
 * @param {React.ReactNode} props.children - Button content
 * @returns {JSX.Element} The rendered Button component
 */
function Button({
  type = "button",
  className = "",
  onClick,
  ariaLabel,
  disabled = false,
  children,
}) {
  return (
    <button
      type={type}
      className={`flex items-center justify-center ${className}`}
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;
