// Estimate reading time in minutes from Portable Text (or any nested content),
// counting words across strings at ~200 wpm. Minimum of 1 minute.
export function calculateReadingTime(body: unknown): number {
  if (!body) return 1;
  let wordCount = 0;
  const countWords = (obj: unknown): void => {
    if (typeof obj === "string") {
      wordCount += obj.split(/\s+/).filter(Boolean).length;
    } else if (Array.isArray(obj)) {
      obj.forEach(countWords);
    } else if (obj && typeof obj === "object") {
      Object.values(obj).forEach(countWords);
    }
  };
  countWords(body);
  return Math.max(1, Math.ceil(wordCount / 200));
}
