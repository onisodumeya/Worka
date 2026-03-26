export type Strength = "weak" | "fair" | "good" | "strong";

export function getPasswordStrength(password: string): {
  strength: Strength;
  score: number;
  label: string;
  color: string;
  width: string;
} {
  if (!password)
    return { strength: "weak", score: 0, label: "", color: "", width: "0%" };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1)
    return {
      strength: "weak",
      score,
      label: "Weak",
      color: "bg-red-400",
      width: "25%",
    };
  if (score === 2)
    return {
      strength: "fair",
      score,
      label: "Fair",
      color: "bg-orange-400",
      width: "50%",
    };
  if (score === 3)
    return {
      strength: "good",
      score,
      label: "Good",
      color: "bg-yellow-400",
      width: "75%",
    };
  return {
    strength: "strong",
    score,
    label: "Strong",
    color: "bg-green-500",
    width: "100%",
  };
}
