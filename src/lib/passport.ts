import passport from 'passport'
import { Strategy as GitHubStrategy } from 'passport-github2'
import { drizzleService } from '@/services/database/drizzle.service'
import { tokenEncryption } from './encryption'

// Serialize user for session storage
passport.serializeUser((user: any, done) => {
  done(null, user.id)
})

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await drizzleService.getUserById(id)
    if (user) {
      // Remove sensitive data from session
      const { githubToken, ...safeUser } = user
      done(null, safeUser)
    } else {
      done(null, false)
    }
  } catch (error) {
    console.error('Error deserializing user:', error)
    done(error, null)
  }
})

// GitHub OAuth Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID!,
  clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  callbackURL: process.env.GITHUB_CALLBACK_URL || '/api/auth/github/callback',
  scope: ['read:user', 'user:email'],
}, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
  try {
    console.log('GitHub OAuth callback received for user:', profile.username)

    // Extract user data from GitHub profile
    const githubId = profile.id.toString()
    const username = profile.username
    const email = profile.emails?.[0]?.value || null
    const name = profile.displayName || profile.name?.givenName || profile.username
    const bio = profile._json?.bio || null
    const profileImageUrl = profile.photos?.[0]?.value || profile._json?.avatar_url
    const githubUrl = profile.profileUrl
    const location = profile._json?.location || null
    const blogUrl = profile._json?.blog || null
    const twitterUsername = profile._json?.twitter_username || null

    // Parse GitHub creation date
    let githubCreatedAt: Date | undefined
    if (profile._json?.created_at) {
      githubCreatedAt = new Date(profile._json.created_at)
    }

    // Extract OAuth scopes (for analytics and future features)
    const githubScopes = profile._json?.scope || profile.scope || 'read:user user:email'

    // Encrypt the access token before storing
    const encryptedToken = tokenEncryption.encryptToken(accessToken)

    // Check if user already exists
    let existingUser = await drizzleService.getUserByGithubId(githubId)

    if (existingUser) {
      // Update existing user with new token and data
      console.log(`Updating existing user: ${username}`)
      const updatedUser = await drizzleService.upsertUser({
        id: existingUser.id,
        githubId,
        username,
        email,
        name,
        bio,
        profileImageUrl,
        githubToken: encryptedToken,
        githubScopes,
        githubUrl,
        blogUrl,
        linkedinUrl: extractLinkedInUrl(blogUrl) || extractLinkedInUrl(bio),
        twitterUsername,
        location,
        githubCreatedAt,
      })

      done(null, updatedUser)
    } else {
      // Create new user
      console.log(`Creating new user: ${username}`)
      const newUser = await drizzleService.upsertUser({
        id: `github_${githubId}`, // Generate unique ID
        githubId,
        username,
        email,
        name,
        bio,
        profileImageUrl,
        githubToken: encryptedToken,
        githubScopes,
        githubUrl,
        blogUrl,
        linkedinUrl: extractLinkedInUrl(blogUrl) || extractLinkedInUrl(bio),
        twitterUsername,
        location,
        githubCreatedAt,
      })

      done(null, newUser)
    }
  } catch (error) {
    console.error('Error in GitHub OAuth strategy:', error)
    done(error, null)
  }
}))

//Extract LinkedIn URL from text
function extractLinkedInUrl(input?: string | null): string | undefined {
  if (!input) return undefined

  const patterns = [
    /https?:\/\/([\w.-]*\.)?linkedin\.com\/[\w\-/?=&#.%]+/i,
    /linkedin\.com\/in\/[\w\-]+/i
  ]

  for (const pattern of patterns) {
    const match = input.match(pattern)
    if (match) {
      let url = match[0]
      // Ensure it has protocol
      if (!url.startsWith('http')) {
        url = 'https://' + url
      }
      return url
    }
  }

  return undefined
}

export default passport
