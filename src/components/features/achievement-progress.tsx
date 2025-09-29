"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Zap, Crown, Award, Target, Users, GitBranch, Flame, Shield } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface AchievementProgress {
  achievement: {
    id: number
    name: string
    description: string
    category: string
    icon: string
    rarity: "common" | "rare" | "epic" | "legendary"
    tier: "bronze" | "silver" | "gold" | "platinum" | "diamond" | "legendary"
    points: number
  }
  progress: number
  maxProgress: number
  progressPercentage: number
  isUnlocked: boolean
  unlockedAt?: Date | null
  nextMilestone?: number
  description: string
  // Leveled achievement properties
  currentLevel?: number
  currentValue?: number
  nextLevelRequirement?: number
  isLeveled?: boolean
  animationIntensity?: number
}

interface AchievementProgressProps {
  achievements: AchievementProgress[]
  title?: string
  showProgress: boolean
  maxDisplay?: number
  groupBy?: "category" | "rarity" | "none"
}

const iconMap: Record<string, any> = {
  "trophy": Trophy,
  "star": Star,
  "zap": Zap,
  "crown": Crown,
  "award": Award,
  "target": Target,
  "users": Users,
  "git-branch": GitBranch,
  "flame": Flame,
  "shield": Shield,
  "git-commit": GitBranch,
  "calendar": Target,
  "heart": Star,
  "sparkles": Star,
  "folder-plus": GitBranch,
  "layers": GitBranch,
  "code": GitBranch,
  "languages": GitBranch,
  "book-open": GitBranch,
  "check-circle": Target,
  "git-merge": GitBranch,
  "eye": Target,
  "trending-up": Zap,
  "rocket": Zap,
  "graduation-cap": Award,
  "sunrise": Star,
  "moon": Star,
  "medal": Award,
  "brain": Award,
  "skull": Award,
}

const rarityColors = {
  common: "border-gray-400 bg-gray-400/10 text-gray-400",
  rare: "border-blue-400 bg-blue-400/10 text-blue-400",
  epic: "border-purple-400 bg-purple-400/10 text-purple-400",
  legendary: "border-yellow-400 bg-yellow-400/10 text-yellow-400 animate-pulse",
}

const tierColors = {
  bronze: "bg-amber-600",
  silver: "bg-gray-400",
  gold: "bg-yellow-500",
  platinum: "bg-purple-500",
  diamond: "bg-blue-500",
  legendary: "bg-gradient-to-r from-yellow-400 to-orange-500",
}

export function AchievementProgressDisplay({ 
  achievements, 
  title = "Achievements", 
  showProgress = true,
  maxDisplay,
  groupBy = "category"
}: AchievementProgressProps) {
  if (achievements.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="text-4xl mb-4">🏆</div>
          <p className="text-muted-foreground">No achievements available yet</p>
        </CardContent>
      </Card>
    )
  }

  const displayAchievements = maxDisplay ? achievements.slice(0, maxDisplay) : achievements

  if (groupBy === "category") {
    return <AchievementProgressByCategory achievements={displayAchievements} title={title} showProgress={showProgress} />
  }

  if (groupBy === "rarity") {
    return <AchievementProgressByRarity achievements={displayAchievements} title={title} showProgress={showProgress} />
  }

  return (
    <div className="space-y-4">
      {title && <h3 className="text-lg font-semibold">{title}</h3>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayAchievements.map((achievement, index) => (
          <AchievementCard 
            key={achievement.achievement.id} 
            achievement={achievement} 
            showProgress={showProgress}
            index={index}
          />
        ))}
      </div>
    </div>
  )
}

function AchievementProgressByCategory({ achievements, title, showProgress }: AchievementProgressProps) {
  const groupedAchievements = achievements.reduce((acc, achievement) => {
    const category = achievement.achievement.category
    if (!acc[category]) acc[category] = []
    acc[category].push(achievement)
    return acc
  }, {} as Record<string, AchievementProgress[]>)

  const categoryNames: Record<string, string> = {
    contributions: "Contributions",
    followers: "Social",
    repositories: "Repositories",
    stars: "Stars",
    streak: "Streaks",
    language_diversity: "Languages",
    issues: "Issues",
    pull_requests: "Pull Requests",
    reviews: "Reviews",
    external_contributions: "Collaboration",
    github_native: "GitHub Native",
    trending: "Trending",
    community: "Community",
    time_based: "Time Based",
    account_age: "Account Age",
  }

  return (
    <div className="space-y-6">
      {title && <h3 className="text-lg font-semibold">{title}</h3>}
      
      {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
        <div key={category} className="space-y-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium">{categoryNames[category] || category}</h4>
            <Badge variant="outline" className="text-xs">
              {categoryAchievements.length}
            </Badge>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categoryAchievements.map((achievement, index) => (
              <AchievementCard 
                key={achievement.achievement.id} 
                achievement={achievement} 
                showProgress={showProgress}
                index={index}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function AchievementProgressByRarity({ achievements, title, showProgress }: AchievementProgressProps) {
  const groupedAchievements = achievements.reduce((acc, achievement) => {
    const rarity = achievement.achievement.rarity
    if (!acc[rarity]) acc[rarity] = []
    acc[rarity].push(achievement)
    return acc
  }, {} as Record<string, AchievementProgress[]>)

  const rarityOrder = ["legendary", "epic", "rare", "common"]

  return (
    <div className="space-y-6">
      {title && <h3 className="text-lg font-semibold">{title}</h3>}
      
      {rarityOrder.map((rarity) => {
        const rarityAchievements = groupedAchievements[rarity]
        if (!rarityAchievements || rarityAchievements.length === 0) return null

        return (
          <div key={rarity} className="space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium capitalize">{rarity} Achievements</h4>
              <Badge variant="outline" className="text-xs">
                {rarityAchievements.length}
              </Badge>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rarityAchievements.map((achievement, index) => (
                <AchievementCard 
                  key={achievement.achievement.id} 
                  achievement={achievement} 
                  showProgress={showProgress}
                  index={index}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function AchievementCard({ achievement, showProgress, index }: { 
  achievement: AchievementProgress, 
  showProgress: boolean,
  index: number 
}) {
  const IconComponent = iconMap[achievement.achievement.icon] || Trophy
  const rarityColor = rarityColors[achievement.achievement.rarity]
  const tierColor = tierColors[achievement.achievement.tier]

  // Enhanced animations for leveled achievements
  const animationVariants = achievement.isLeveled ? {
    initial: { opacity: 0, y: 20, scale: 0.9 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        delay: index * 0.1,
        type: "spring" as const,
        stiffness: 100
      }
    },
    hover: { 
      scale: 1.05,
      rotateY: achievement.animationIntensity ? achievement.animationIntensity * 5 : 0,
      transition: { type: "spring" as const, stiffness: 300 }
    }
  } : {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { delay: index * 0.1 } },
    hover: { scale: 1.05 }
  } as const

  const cardContent = (
    <motion.div
      initial={animationVariants.initial}
      animate={animationVariants.animate}
      whileHover={animationVariants.hover}
      style={{
        perspective: "1000px"
      }}
    >
      <Card className={`relative transition-all hover:scale-105 ${rarityColor} ${achievement.isUnlocked ? 'ring-2 ring-green-400' : ''} ${achievement.isLeveled ? 'overflow-hidden' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${rarityColor} ${achievement.isLeveled ? 'relative' : ''}`}>
                <IconComponent className="h-5 w-5" />
                {achievement.isLeveled && achievement.currentLevel && achievement.currentLevel >= 10 && (
                  <div className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {achievement.currentLevel}
                  </div>
                )}
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">
                  {achievement.achievement.name}
                  {achievement.isLeveled && achievement.currentLevel && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      Lv.{achievement.currentLevel}
                    </span>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {achievement.achievement.rarity}
                  </Badge>
                  <div className={`w-3 h-3 rounded-full ${tierColor}`} title={achievement.achievement.tier} />
                  {achievement.isLeveled && (
                    <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400 border-blue-400">
                      Leveled
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {achievement.isUnlocked && (
              <div className="text-green-400">
                <Trophy className="h-5 w-5" />
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground mb-3">{achievement.description}</p>
          
          {showProgress && (
            <div className="space-y-2">
              {achievement.isLeveled ? (
                // Leveled achievement progress display
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Level {achievement.currentLevel || 0}</span>
                    <span>{achievement.currentValue || 0} / {achievement.nextLevelRequirement || 1}</span>
                  </div>
                  <Progress 
                    value={achievement.progressPercentage} 
                    className="h-2"
                    style={{
                      background: `linear-gradient(90deg, ${achievement.animationIntensity ? `hsl(${achievement.animationIntensity * 360}, 70%, 50%)` : '#3b82f6'} ${achievement.progressPercentage}%, #e5e7eb ${achievement.progressPercentage}%)`
                    }}
                  />
                  {achievement.nextLevelRequirement && (
                    <p className="text-xs text-muted-foreground">
                      Next Level: {achievement.nextLevelRequirement}
                    </p>
                  )}
                </div>
              ) : (
                // Non-leveled achievement progress display
                !achievement.isUnlocked && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Progress</span>
                      <span>{achievement.progress} / {achievement.maxProgress}</span>
                    </div>
                    <Progress value={achievement.progressPercentage} className="h-2" />
                    {achievement.nextMilestone && (
                      <p className="text-xs text-muted-foreground">
                        Next: {achievement.nextMilestone}
                      </p>
                    )}
                  </div>
                )
              )}
            </div>
          )}
          
          {achievement.isUnlocked && achievement.unlockedAt && (
            <div className="text-xs text-green-600">
              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
            </div>
          )}
          
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-muted-foreground">
              {achievement.achievement.points} pts
            </span>
            {achievement.isUnlocked && (
              <Badge variant="secondary" className="text-xs">
                {achievement.isLeveled ? `Level ${achievement.currentLevel || 0}` : "Unlocked"}
              </Badge>
            )}
          </div>
        </CardContent>
        
        {/* Enhanced visual effects for leveled achievements */}
        {achievement.isLeveled && achievement.animationIntensity && achievement.animationIntensity > 0.5 && (
          <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-yellow-400/20 to-orange-400/20 blur-sm -z-10 animate-pulse" />
        )}
        
        {achievement.achievement.rarity === "legendary" && (
          <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-yellow-400/10 to-orange-400/10 blur-sm -z-10" />
        )}
      </Card>
    </motion.div>
  )

  if (showProgress) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {cardContent}
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <div className="font-semibold">{achievement.achievement.name}</div>
              <div className="text-sm text-muted-foreground">{achievement.description}</div>
              <div className="text-xs mt-1">
                {achievement.isUnlocked ? "Unlocked" : `${achievement.progressPercentage.toFixed(1)}% complete`}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return cardContent
}
