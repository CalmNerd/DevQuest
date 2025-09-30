/**
 * Badge component to display user's GitHub OAuth access level
 */

import { Badge } from './badge'
import { Shield, Lock, HelpCircle } from 'lucide-react'
import { getAccessLevel, getAccessLevelLabel } from '@/lib/scope-utils'

interface AccessLevelBadgeProps {
  githubScopes?: string | null
  className?: string
  showIcon?: boolean
}

export function AccessLevelBadge({ 
  githubScopes, 
  className,
  showIcon = true 
}: AccessLevelBadgeProps) {
  const level = getAccessLevel(githubScopes)
  const label = getAccessLevelLabel(githubScopes)

  if (level === 'unknown') {
    return null
  }

  const Icon = level === 'enhanced' ? Shield : Lock

  return (
    <Badge 
      variant={level === 'enhanced' ? 'default' : 'secondary'}
      className={className}
    >
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {label}
    </Badge>
  )
}

/**
 * Detailed access level card with description
 */
export function AccessLevelCard({ githubScopes }: { githubScopes?: string | null }) {
  const level = getAccessLevel(githubScopes)

  if (level === 'unknown') {
    return (
      <div className="flex items-start gap-3 p-4 bg-muted rounded-lg border">
        <HelpCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
        <div>
          <h4 className="font-medium">Access Level Unknown</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Log in to see your GitHub access level and statistics.
          </p>
        </div>
      </div>
    )
  }

  if (level === 'basic') {
    return (
      <div className="flex items-start gap-3 p-4 bg-secondary/50 rounded-lg border">
        <Lock className="w-5 h-5 text-secondary-foreground mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium">Basic Access</h4>
            <AccessLevelBadge githubScopes={githubScopes} showIcon={false} />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Your statistics include public repositories only. 
            <a href="/onboarding" className="text-primary hover:underline ml-1">
              Upgrade to Enhanced Access
            </a> to include private repositories.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
      <Shield className="w-5 h-5 text-primary mt-0.5" />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">Enhanced Access</h4>
          <AccessLevelBadge githubScopes={githubScopes} showIcon={false} />
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Your statistics include both public and private repositories for the most accurate tracking.
        </p>
      </div>
    </div>
  )
}
