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

export function getPowerProgress(points: number): {
  level: number
  pointsIntoLevel: number
  nextLevelCost: number
  pointsToNext: number
  progressPercent: number
} {
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

  const nextLevelCost = 100 + 20 * level + 3 * level * level
  const pointsIntoLevel = Math.max(0, points - cumulative)
  const pointsToNext = Math.max(0, nextLevelCost - pointsIntoLevel)
  const progressPercent = Math.max(0, Math.min(100, Math.floor((pointsIntoLevel / nextLevelCost) * 100)))

  return { level, pointsIntoLevel, nextLevelCost, pointsToNext, progressPercent }
}
