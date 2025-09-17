# Gamified GitHub profiles

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/mohittjees-projects/v0-gamified-git-hub-profiles)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/2v23NaNhIuk)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Environment Setup

To use the GitHub API features, you need to set up a GitHub Personal Access Token:

1. Go to [GitHub Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Generate a new token with the following scopes:
   - `repo` (for repository access)
   - `user` (for user profile data)
   - `read:org` (for organization data, if needed)
3. Set the environment variable:
   ```bash
   GITHUB_TOKEN=your_github_personal_access_token_here
   ```

**Note:** Without a valid GitHub token, the app will fall back to mock data for issues and may have limited functionality.

## Deployment

Your project is live at:

**[https://vercel.com/mohittjees-projects/v0-gamified-git-hub-profiles](https://vercel.com/mohittjees-projects/v0-gamified-git-hub-profiles)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/2v23NaNhIuk](https://v0.app/chat/projects/2v23NaNhIuk)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository