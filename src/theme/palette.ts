// Derives a small, usable palette from ONE color: the club's own
// GymSettings.primaryColor (the only brand color the backend actually
// stores — there's no separate "secondary" field). Rather than invent a
// second brand color out of nothing, the secondary/accent below is always
// computed FROM the primary (a muted tint), so it's never hardcoded and
// never clashes with whatever a club picked.
//
// Falls back to a neutral emerald when a club hasn't set one yet — matches
// the web app's own default (see GymSettings.primaryColor's @default in
// the Prisma schema) so both surfaces agree before a club customizes it.
const FALLBACK_PRIMARY = "#0f172a";

function hexToRgb(hex: string): [number, number, number] | null {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!match) return null;
  return [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return `#${[r, g, b].map((n) => clamp(n).toString(16).padStart(2, "0")).join("")}`;
}

function mix(hex: string, withHex: string, amount: number): string {
  const a = hexToRgb(hex);
  const b = hexToRgb(withHex);
  if (!a || !b) return hex;
  return rgbToHex(
    a[0] + (b[0] - a[0]) * amount,
    a[1] + (b[1] - a[1]) * amount,
    a[2] + (b[2] - a[2]) * amount
  );
}

/** Rough perceived-brightness check, used to pick readable text on a color chip. */
function isDarkColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return true;
  const [r, g, b] = rgb;
  return (r * 299 + g * 587 + b * 114) / 1000 < 140;
}

export interface Palette {
  primary: string;
  primaryText: string; // readable text/icon color ON TOP of `primary`
  accent: string; // a lighter tint of primary, used sparingly (badges, highlights)
  background: string;
  surface: string; // card backgrounds
  border: string;
  text: string;
  textMuted: string;
  success: string;
  danger: string;
  warning: string;
}

export function buildPalette(clubPrimaryColor: string | null | undefined, dark: boolean): Palette {
  const primary = clubPrimaryColor && hexToRgb(clubPrimaryColor) ? clubPrimaryColor : FALLBACK_PRIMARY;

  if (dark) {
    return {
      primary,
      primaryText: isDarkColor(primary) ? "#ffffff" : "#0a0a0a",
      accent: mix(primary, "#ffffff", 0.35),
      background: "#0b0b0f",
      surface: "#17171d",
      border: "#2a2a33",
      text: "#f5f5f7",
      textMuted: "#9a9aa5",
      success: "#22c55e",
      danger: "#ef4444",
      warning: "#f59e0b",
    };
  }

  return {
    primary,
    primaryText: isDarkColor(primary) ? "#ffffff" : "#0a0a0a",
    accent: mix(primary, "#000000", 0.12),
    background: "#f7f7f9",
    surface: "#ffffff",
    border: "#e6e6eb",
    text: "#111114",
    textMuted: "#6b6b76",
    success: "#16a34a",
    danger: "#dc2626",
    warning: "#d97706",
  };
}
