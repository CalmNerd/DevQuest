# API Documentation

## GitHub Profile API

### GET /api/github/[username]

Fetches comprehensive GitHub profile data including statistics, achievements, and repositories.

**Parameters:**
- `username` (string, required): GitHub username
- `refresh` (boolean, optional): Force refresh of cached data

**Response:**
```json
{
  "id": 12345,
  "login": "username",
  "name": "User Name",
  "bio": "User bio",
  "avatar_url": "https://...",
  "html_url": "https://github.com/username",
  "totalStars": 150,
  "totalForks": 45,
  "totalCommits": 1200,
  "points": 2500,
  "powerLevel": 15,
  "achievements": ["first-star", "repo-creator"],
  "repos": [...],
  "contributionGraph": {...}
}
```

## Leaderboards API

### GET /api/leaderboards

Fetches leaderboard data for different metrics and time periods.

**Query Parameters:**
- `type` (string): Type of leaderboard - "points", "stars", "streak", "commits", "repos", "followers"
- `period` (string): Time period - "daily", "weekly", "monthly", "yearly", "global"
- `limit` (number): Number of entries to return (default: 50)

**Response:**
```json
{
  "type": "points",
  "period": "global",
  "entries": [
    {
      "rank": 1,
      "username": "topuser",
      "name": "Top User",
      "avatar_url": "https://...",
      "score": 5000,
      "metric": "points"
    }
  ],
  "total": 50,
  "lastUpdated": "2024-01-01T00:00:00Z"
}
```

## Issues API

### GET /api/issues

Searches for GitHub issues across repositories.

**Query Parameters:**
- `query` (string): Search query
- `language` (string): Programming language filter
- `difficulty` (string): Difficulty level - "easy", "medium", "hard"
- `labels` (string[]): Array of label names
- `limit` (number): Number of results (default: 20)
- `page` (number): Page number (default: 1)

**Response:**
```json
{
  "issues": [
    {
      "id": 123,
      "number": 456,
      "title": "Issue title",
      "body": "Issue description",
      "state": "open",
      "labels": [...],
      "repository": {
        "name": "repo-name",
        "full_name": "owner/repo-name",
        "stargazers_count": 100
      }
    }
  ],
  "total": 50,
  "page": 1,
  "hasMore": true
}
```
