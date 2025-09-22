import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

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