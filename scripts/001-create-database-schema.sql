-- Create sessions table for Replit Auth
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);

-- Create users table (enhanced for authentication and profile)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY,
  github_id VARCHAR UNIQUE,
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  name VARCHAR,
  bio TEXT,
  profile_image_url VARCHAR,
  username VARCHAR UNIQUE,
  github_token TEXT,
  github_url VARCHAR,
  blog_url VARCHAR,
  linkedin_url VARCHAR,
  twitter_username VARCHAR,
  location VARCHAR,
  github_created_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create github_stats table (enhanced for comprehensive user statistics)
CREATE TABLE IF NOT EXISTS github_stats (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Contribution metrics (not commits)
  daily_contributions INTEGER DEFAULT 0,
  weekly_contributions INTEGER DEFAULT 0,
  monthly_contributions INTEGER DEFAULT 0,
  yearly_contributions INTEGER DEFAULT 0,
  last_365_contributions INTEGER DEFAULT 0,
  this_year_contributions INTEGER DEFAULT 0,
  overall_contributions INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  
  -- Basic stats
  total_stars INTEGER DEFAULT 0,
  total_forks INTEGER DEFAULT 0,
  contributed_to INTEGER DEFAULT 0,
  total_repositories INTEGER DEFAULT 0,
  followers INTEGER DEFAULT 0,
  following INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  top_language VARCHAR,
  language_stats JSONB,
  contribution_graph JSONB,
  
  -- New fields for comprehensive achievements
  total_commits INTEGER DEFAULT 0,
  meaningful_commits INTEGER DEFAULT 0, -- additions > deletions
  total_pull_requests INTEGER DEFAULT 0,
  merged_pull_requests INTEGER DEFAULT 0,
  total_issues INTEGER DEFAULT 0,
  closed_issues INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  external_contributors INTEGER DEFAULT 0, -- repos with external contributors
  repos_with_stars INTEGER DEFAULT 0, -- repos with stars
  repos_with_forks INTEGER DEFAULT 0, -- repos with forks
  dependency_usage INTEGER DEFAULT 0, -- repos reused as dependencies
  language_count INTEGER DEFAULT 0, -- number of languages contributed in
  top_language_percentage INTEGER DEFAULT 0, -- % of contributions in top language
  rare_language_repos INTEGER DEFAULT 0, -- repos in rare languages
  
  last_fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create achievements table (enhanced for defining available achievements with tiers)
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR NOT NULL, -- commit_streak, languages, stars, contributions, etc.
  icon VARCHAR NOT NULL,
  rarity VARCHAR NOT NULL DEFAULT 'common', -- common, rare, epic, legendary
  tier VARCHAR NOT NULL DEFAULT 'bronze', -- bronze, silver, gold, legendary
  criteria JSONB NOT NULL, -- JSON object defining unlock criteria
  points INTEGER DEFAULT 0, -- Points awarded for unlocking this achievement
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_achievements table (enhanced for tracking unlocked achievements)
CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  progress INTEGER DEFAULT 0, -- Current progress towards achievement
  max_progress INTEGER DEFAULT 1 -- Target progress needed
);

-- Create leaderboards table (enhanced for tracking different leaderboard periods)
CREATE TABLE IF NOT EXISTS leaderboards (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period VARCHAR NOT NULL, -- daily, weekly, monthly, yearly, overall
  period_date VARCHAR NOT NULL, -- YYYY-MM-DD for daily, YYYY-WW for weekly, etc.
  commits INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0, -- Points used for power level (not for ranking)
  rank INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leaderboard_period_date ON leaderboards(period, period_date);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboards(rank);
CREATE UNIQUE INDEX IF NOT EXISTS idx_leaderboard_user_period_date ON leaderboards(user_id, period, period_date);

-- Insert some sample achievements with enhanced criteria
INSERT INTO achievements (name, description, icon, category, rarity, tier, criteria, points) VALUES
('First Commit', 'Made your first commit', '🎯', 'total_commits', 'common', 'bronze', '{"totalCommits": 1}', 10),
('Streak Master', 'Maintained a 30-day contribution streak', '🔥', 'commit_streak', 'rare', 'gold', '{"currentStreak": 30}', 100),
('Star Collector', 'Earned 100 stars across repositories', '⭐', 'repo_stars', 'uncommon', 'silver', '{"totalStars": 100}', 50),
('Language Explorer', 'Used 10 different programming languages', '🌍', 'language_count', 'uncommon', 'silver', '{"languageCount": 10}', 75),
('Open Source Hero', 'Contributed to 50 different repositories', '🦸', 'external_contributors', 'epic', 'legendary', '{"externalContributors": 50}', 200),
('Bug Hunter', 'Closed 100 issues', '🐛', 'closed_issues', 'rare', 'gold', '{"closedIssues": 100}', 150),
('Code Reviewer', 'Reviewed 500 pull requests', '👀', 'pr_reviews', 'rare', 'gold', '{"totalReviews": 500}', 125),
('Repository Creator', 'Created 25 public repositories', '📦', 'repositories', 'uncommon', 'silver', '{"totalRepositories": 25}', 80),
('Meaningful Contributor', 'Made 1000 meaningful commits', '💎', 'meaningful_commits', 'rare', 'gold', '{"meaningfulCommits": 1000}', 200),
('PR Master', 'Merged 100 pull requests', '🚀', 'external_prs', 'rare', 'gold', '{"mergedPullRequests": 100}', 150),
('Dependency Provider', 'Created repos used as dependencies', '🔗', 'dependency_usage', 'uncommon', 'silver', '{"dependencyUsage": 5}', 100),
('Rare Language Expert', 'Contributed to repos in rare languages', '🔮', 'rare_languages', 'epic', 'legendary', '{"rareLanguageRepos": 3}', 300)
ON CONFLICT DO NOTHING;
