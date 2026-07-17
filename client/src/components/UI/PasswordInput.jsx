import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

/**
 * Password field with a show/hide toggle, styled to match the icon-prefixed
 * inputs used across the auth forms.
 */
function PasswordInput({ id, value, onChange, placeholder, required = true, autoComplete, accentClass = "text-primary" }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${accentClass}`} />
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
      />
      <button
        type="button"
        onClick={() => setVisible((prev) => !prev)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        aria-label={visible ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {visible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
}

export default PasswordInput;
