function clamp(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)))
}

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace("#", "")
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  return [r, g, b]
}

export function hexToRgba(hex: string, alpha: number): string {
  const [r, g, b] = parseHex(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function darken(hex: string, amount = 0.28): string {
  const [r, g, b] = parseHex(hex)
  return `rgb(${clamp(r * (1 - amount))}, ${clamp(g * (1 - amount))}, ${clamp(b * (1 - amount))})`
}

/** Choose black or white text for contrast against a solid hex background. */
export function readableText(hex: string): string {
  const [r, g, b] = parseHex(hex)
  // relative luminance
  const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return l > 0.6 ? "#1a1a1a" : "#ffffff"
}
