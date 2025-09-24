import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import githubColors from "@/lib/github-colors.json"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Power Level Calculation
export function getPowerLevelFromPoints(points: number): number {
  let level = 0
  let cumulative = 0
  while (true) {
    const n = level
    const cost = 100 + 20 * n + 3 * n * n
    if (cumulative + cost > points) break
    cumulative += cost
    level += 1
    if (level > 10000) break
  }
  return level
}

export const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInHours < 1) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays < 365) {
    return `${diffInDays}d ago`;
  } else {
    return `${diffInYears}y ago`;
  }
}

export function formatMarkdownPreview(
  text: string | null | undefined,
  options?: {
    maxLength?: number
    codeBlockReplacement?: string
  }
): string {
  if (!text) return "";

  // Set default options
  const maxLength = options?.maxLength ?? 200;
  const codeBlockReplacement = options?.codeBlockReplacement ?? "[Code Block]";

  let cleaned = text;

  // Remove HTML comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');

  // Remove markdown headers (##, ###, etc.)
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');

  // Remove markdown bold/italic formatting
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1');
  cleaned = cleaned.replace(/\*(.*?)\*/g, '$1');

  // Remove markdown code blocks
  cleaned = cleaned.replace(/```[\s\S]*?```/g, codeBlockReplacement);
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');

  // Remove markdown links but keep the text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove markdown lists (-, *, +)
  cleaned = cleaned.replace(/^[\s]*[-*+]\s+/gm, '• ');

  // Remove excessive whitespace and newlines
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
  cleaned = cleaned.replace(/^\s+|\s+$/gm, '');

  // Remove auto-sync timestamps and sources (for issues)
  cleaned = cleaned.replace(/Auto-synced.*$/gm, '');
  cleaned = cleaned.replace(/Source:.*$/gm, '');

  // Clean up remaining whitespace
  cleaned = cleaned.trim();

  // Limit to reasonable length for preview
  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength) + '...';
  }

  return cleaned;
}

// Rainbow colors array
export const RAINBOW_COLORS = [
  '#FF0000', // Red
  '#FF7F00', // Orange
  '#FFFF00', // Yellow
  '#00FF00', // Green
  '#0000FF', // Blue
  '#4B0082', // Indigo
  '#9400D3'  // Violet
] as const

export const getLanguageColor = (language: string) => {
  return (githubColors as any)[language] || "#6b7280"
}

export const formatSize = (size: number) => {
  if (size < 1024) return `${size} KB`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} MB`
  return `${(size / (1024 * 1024)).toFixed(1)} GB`
}