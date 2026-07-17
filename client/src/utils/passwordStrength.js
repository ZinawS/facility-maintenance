/**
 * Mirrors the server's password rule (server/routes/auth.js PASSWORD_RULE):
 * min 8 chars, at least one uppercase, one lowercase, one number. Extra
 * points here are purely cosmetic (a fuller meter), not enforced.
 */
export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "", meetsRequirement: false };

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isLongEnough = password.length >= 8;
  const isVeryLong = password.length >= 12;

  const meetsRequirement = isLongEnough && hasLower && hasUpper && hasNumber;

  let score = 0;
  if (isLongEnough) score += 1;
  if (hasLower && hasUpper) score += 1;
  if (hasNumber) score += 1;
  if (hasSpecial) score += 1;
  if (isVeryLong) score += 1;

  const labels = ["Very weak", "Weak", "Fair", "Good", "Strong"];
  const label = labels[Math.min(score, labels.length - 1)];

  return { score, label, meetsRequirement };
}
