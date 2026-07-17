import { getPasswordStrength } from "../../utils/passwordStrength";

const BAR_COLORS = ["bg-red-500", "bg-orange-500", "bg-amber-400", "bg-lime-500", "bg-green-500"];

function PasswordStrengthMeter({ password }) {
  if (!password) return null;
  const { score, label, meetsRequirement } = getPasswordStrength(password);

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i <= score - 1 ? BAR_COLORS[score - 1] : "bg-gray-200"}`}
          />
        ))}
      </div>
      <p className={`text-xs ${meetsRequirement ? "text-green-600" : "text-gray-500"}`}>
        {label}
        {!meetsRequirement && " — needs 8+ characters with uppercase, lowercase, and a number"}
      </p>
    </div>
  );
}

export default PasswordStrengthMeter;
