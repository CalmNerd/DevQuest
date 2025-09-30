export type AccessLevel = 'basic' | 'enhanced' | 'unknown'

export function hasRepoAccess(githubScopes?: string | null): boolean {
    if (!githubScopes) return false
    return githubScopes.includes('repo')
}

export function getAccessLevel(githubScopes?: string | null): AccessLevel {
    if (!githubScopes) return 'unknown'
    return hasRepoAccess(githubScopes) ? 'enhanced' : 'basic'
}

export function getAccessLevelDescription(githubScopes?: string | null): string {
    const level = getAccessLevel(githubScopes)

    switch (level) {
        case 'enhanced':
            return 'Enhanced Access - Includes private repositories'
        case 'basic':
            return 'Basic Access - Public repositories only'
        case 'unknown':
            return 'Access level unknown'
    }
}

export function getAccessLevelLabel(githubScopes?: string | null): string {
    const level = getAccessLevel(githubScopes)

    switch (level) {
        case 'enhanced':
            return 'Enhanced'
        case 'basic':
            return 'Basic'
        case 'unknown':
            return 'Unknown'
    }
}

export function shouldPromptUpgrade(githubScopes?: string | null): boolean {
    return getAccessLevel(githubScopes) === 'basic'
}
