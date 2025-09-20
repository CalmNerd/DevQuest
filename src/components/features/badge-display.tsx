"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { BadgeSystem, type BadgeDefinition } from "@/services/api/badge.service"

interface BadgeDisplayProps {
  badgeIds: string[]
  size?: "sm" | "md" | "lg"
  showTooltip?: boolean
  maxDisplay?: number
  className?: string
}

export function BadgeDisplay({ badgeIds, size = "md", showTooltip = true, maxDisplay, className }: BadgeDisplayProps) {
  const badges = badgeIds
    .map((id) => BadgeSystem.getBadgeDefinition(id))
    .filter((badge): badge is BadgeDefinition => badge !== undefined)

  const displayBadges = maxDisplay ? badges.slice(0, maxDisplay) : badges
  const remainingCount = maxDisplay && badges.length > maxDisplay ? badges.length - maxDisplay : 0

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "h-8 w-8 text-xs"
      case "lg":
        return "h-16 w-16 text-lg"
      default:
        return "h-12 w-12 text-sm"
    }
  }

  if (badges.length === 0) {
    return null
  }

  return (
    <TooltipProvider>
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {displayBadges.map((badge, index) => {
          const IconComponent = badge.icon
          const rarityColor = BadgeSystem.getRarityColor(badge.rarity)
          const rarityGlow = BadgeSystem.getRarityGlow(badge.rarity)

          const badgeElement = (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`relative flex items-center justify-center rounded-lg border-2 ${rarityColor} ${rarityGlow} ${getSizeClasses()} transition-all hover:scale-110 cursor-pointer`}
            >
              <IconComponent
                className={`${badge.color} ${size === "sm" ? "h-4 w-4" : size === "lg" ? "h-8 w-8" : "h-6 w-6"}`}
              />
              {badge.rarity === "legendary" && (
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-yellow-400/20 to-orange-400/20 blur-sm" />
              )}
            </motion.div>
          )

          if (showTooltip) {
            return (
              <Tooltip key={badge.id}>
                <TooltipTrigger asChild>{badgeElement}</TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <div className="font-semibold">{badge.name}</div>
                    <div className="text-sm text-muted-foreground">{badge.description}</div>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {badge.rarity}
                    </Badge>
                  </div>
                </TooltipContent>
              </Tooltip>
            )
          }

          return badgeElement
        })}

        {remainingCount > 0 && (
          <div
            className={`flex items-center justify-center rounded-lg border-2 border-muted bg-muted/10 ${getSizeClasses()}`}
          >
            <span className="text-muted-foreground">+{remainingCount}</span>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

interface BadgeGridProps {
  badgeIds: string[]
  title?: string
  emptyMessage?: string
}

export function BadgeGrid({ badgeIds, title, emptyMessage = "No badges earned yet" }: BadgeGridProps) {
  const badges = badgeIds
    .map((id) => BadgeSystem.getBadgeDefinition(id))
    .filter((badge): badge is BadgeDefinition => badge !== undefined)

  // Group badges by rarity
  const badgesByRarity = badges.reduce(
    (acc, badge) => {
      if (!acc[badge.rarity]) acc[badge.rarity] = []
      acc[badge.rarity].push(badge)
      return acc
    },
    {} as Record<string, BadgeDefinition[]>,
  )

  const rarityOrder = ["legendary", "epic", "rare", "common"]

  if (badges.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="text-4xl mb-4">🏆</div>
          <p className="text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {title && <h3 className="text-lg font-semibold">{title}</h3>}

      {rarityOrder.map((rarity) => {
        const rarityBadges = badgesByRarity[rarity]
        if (!rarityBadges || rarityBadges.length === 0) return null

        return (
          <div key={rarity} className="space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium capitalize">{rarity} Badges</h4>
              <Badge variant="outline" className="text-xs">
                {rarityBadges.length}
              </Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rarityBadges.map((badge, index) => {
                const IconComponent = badge.icon
                const rarityColor = BadgeSystem.getRarityColor(badge.rarity)
                const rarityGlow = BadgeSystem.getRarityGlow(badge.rarity)

                return (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`relative transition-all hover:scale-105 ${rarityColor} ${rarityGlow}`}>
                      <CardContent className="p-4 text-center">
                        <div className="mb-3 flex justify-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background/50">
                            <IconComponent className={`h-6 w-6 ${badge.color}`} />
                          </div>
                        </div>
                        <h4 className="mb-1 font-semibold">{badge.name}</h4>
                        <p className="text-sm text-muted-foreground">{badge.description}</p>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {badge.rarity}
                        </Badge>
                      </CardContent>
                      {badge.rarity === "legendary" && (
                        <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-yellow-400/10 to-orange-400/10 blur-sm -z-10" />
                      )}
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
