/** "80 TND" / "79,90 TND". Payments are recorded in TND by the backend (currency defaults to "TND"); plans carry no currency field of their own. */
export function formatPrice(amount: number): string {
  const text = Number.isInteger(amount) ? String(amount) : amount.toFixed(2).replace(".", ",");
  return `${text} TND`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}
