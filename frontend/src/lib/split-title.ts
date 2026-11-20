/**
 * Splits a one-line title into the design's two tones: "Your Day, Your Way." →
 * ["Your Day,", "Your Way."]. Splits after the first comma (or full stop) that
 * has text after it; a title without one stays whole.
 */
export function splitTitle(title: string): [lead: string, accent: string] {
  const match = /^(.+?[,.،،]) (.+)$/u.exec(title.trim());
  return match ? [match[1], match[2]] : [title.trim(), ""];
}
