export function calculateReadingTime(content: string): number {
  if (!content) return 1;
  // Remove MDX/HTML tags and code blocks from rough word count
  const cleanText = content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/#[^\n]*/g, "")
    .trim();
  const words = cleanText.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
