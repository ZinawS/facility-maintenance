import { Link } from "react-router-dom";

/**
 * Button component for reusable button UI. Renders a router <Link> when
 * `href` is provided (internal navigation), an <a> for external URLs, or a
 * plain <button> otherwise.
 * @param {Object} props - Component props
 * @param {string} [props.type="button"] - Button type (button, submit, etc.)
 * @param {string} [props.href] - If set, renders as a link instead of a button
 * @param {string} [props.className] - Additional CSS classes
 * @param {Function} [props.onClick] - Click handler
 * @param {string} [props.ariaLabel] - ARIA label for accessibility
 * @param {boolean} [props.disabled=false] - Disable button
 * @param {React.ReactNode} props.children - Button content
 * @returns {JSX.Element} The rendered Button component
 */
function Button({
  type = "button",
  href,
  className = "",
  onClick,
  ariaLabel,
  disabled = false,
  children,
}) {
  const classes = `flex items-center justify-center ${className} ${
    disabled ? "opacity-60 cursor-not-allowed" : ""
  }`;

  if (href && !disabled) {
    const isExternal = /^https?:\/\//.test(href);
    if (isExternal) {
      return (
        <a href={href} className={classes} aria-label={ariaLabel} onClick={onClick} target="_blank" rel="noreferrer">
          {children}
        </a>
      );
    }
    return (
      <Link to={href} className={classes} aria-label={ariaLabel} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick} aria-label={ariaLabel} disabled={disabled}>
      {children}
    </button>
  );
}

export default Button;
