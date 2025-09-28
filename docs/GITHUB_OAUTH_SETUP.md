# GitHub OAuth Setup Guide

This guide explains how to set up GitHub OAuth authentication for DevQuest, including encrypted token storage and user-specific API access.

## Overview

The implementation includes:
- **GitHub OAuth flow** using Passport.js
- **Encrypted token storage** in the database
- **User-specific API calls** with higher rate limits
- **Background service integration** using user tokens
- **Optional authentication** (login not mandatory)

## Features

### 🔐 Secure Token Storage
- OAuth tokens are encrypted using AES-256-GCM
- Tokens are decrypted only when needed for API calls
- Fallback to app token if user token fails

### 🚀 Enhanced API Access
- **5,000 requests/hour** per user (vs 60/hour for app token)
- Access to **private repositories**
- More accurate user data and statistics

### 🔄 Background Service Integration
- Background service uses user tokens when available
- Automatic fallback to app token
- Improved data accuracy for leaderboards

## Setup Instructions

### 1. Environment Configuration

Copy `env.example` to `.env.local` and configure:

```bash
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback

# GitHub API Token (Fallback)
GITHUB_TOKEN=ghp_your_personal_access_token_here

# Token Encryption
ENCRYPTION_KEY=your_32_byte_hex_encryption_key_here
```

### 2. GitHub OAuth App Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/applications/new)
2. Create a new OAuth App:
   - **Application name**: DevQuest
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/github/callback`
3. Copy the Client ID and Client Secret to your `.env.local`

### 3. Personal Access Token (Fallback)

1. Go to [GitHub Personal Access Tokens](https://github.com/settings/tokens)
2. Generate a new token with scopes:
   - `read:user`
   - `user:email`
   - `repo`
   - `read:org`
3. Copy the token to your `.env.local`

### 4. Encryption Key Generation

Generate a secure encryption key:

```bash
openssl rand -hex 32
```

Copy the output to your `.env.local` as `ENCRYPTION_KEY`.

## API Endpoints

### Authentication Routes

- `GET /api/auth/github` - Initiate GitHub OAuth
- `GET /api/auth/github/callback` - OAuth callback handler
- `GET /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

### Usage Examples

#### Login Button
```tsx
import { LoginButton } from '@/components/auth'

<LoginButton returnUrl="/dashboard">
  Sign in with GitHub
</LoginButton>
```

#### User Profile
```tsx
import { UserProfile } from '@/components/auth'

<UserProfile />
```

#### Server-side Authentication
```typescript
import { getCurrentUser, getUserGitHubToken } from '@/lib/auth-utils'

// Get current user
const user = await getCurrentUser(request)

// Get user's GitHub token
const token = await getUserGitHubToken(request)
```

## Background Service Integration

The background service automatically:
1. **Decrypts user tokens** when available
2. **Uses user tokens** for API calls (higher rate limits)
3. **Falls back to app token** if user token fails
4. **Logs token usage** for debugging

### Example Log Output
```
Using user's GitHub token for username
Updating data for user: username (full fetch)
Successfully updated user: username (full fetch)
```

## Security Considerations

### Token Encryption
- Tokens are encrypted using AES-256-GCM
- Encryption key stored in environment variables
- Tokens are decrypted only when needed

### Session Management
- User sessions stored in HTTP-only cookies
- Automatic token refresh handling
- Secure logout functionality

### Rate Limiting
- Respects GitHub's rate limits per token
- Automatic fallback to app token
- Batch processing to avoid rate limits

## Troubleshooting

### Common Issues

1. **OAuth callback fails**
   - Check callback URL matches GitHub app settings
   - Verify environment variables are set

2. **Token decryption fails**
   - Check encryption key is correct
   - Verify token format in database

3. **Rate limit exceeded**
   - Background service automatically falls back to app token
   - Check GitHub API rate limit status

### Debug Logging

Enable debug logging by checking console output:
- Token encryption/decryption status
- API call success/failure
- Rate limit information

## Migration from App-Only Tokens

The system is backward compatible:
1. **Existing users** continue to work with app token
2. **New users** can authenticate for enhanced features
3. **Gradual migration** as users authenticate

## Future Enhancements

- [ ] Token refresh handling
- [ ] Multiple OAuth providers
- [ ] Advanced session management
- [ ] User preference settings
- [ ] API usage analytics
