# DevQuest - Gamified GitHub Profiles 🎮

## Overview

DevQuest is a comprehensive Next.js application that transforms GitHub profiles into an engaging gaming experience. By integrating competitive leaderboards, advanced achievement systems, power leveling mechanics, and Discord-style profile cards, DevQuest makes open-source contributions exciting and rewarding for developers worldwide.

## ✨ Core Features

### 🏆 Multi-Dimensional Leaderboard System
- **Real-time Competitive Rankings** - Dynamic leaderboards across multiple timeframes (daily, weekly, monthly, yearly, all-time)
- **Session-Based Contests** - Automated contest cycles with rank tracking and historical data
- **Multiple Metrics** - Compete on points, stars, commits, streaks, repositories, and followers
- **Global Positioning** - See your rank among all DevQuest users with paginated views
- **Live Updates** - Automatic background service refreshes leaderboard data every 5 minutes

### 🎖️ Advanced Achievement System
- **90+ Unique Badges** - Comprehensive achievement categories covering all aspects of GitHub activity
- **Leveled Achievements** - Progressive badges with 11 categories using dynamic mathematical formulas
- **Tier System** - Bronze, Silver, Gold, Platinum, Diamond, and Legendary tiers with visual effects
- **Rarity Levels** - Common, Rare, Epic, and Legendary achievements with increasing difficulty
- **GitHub Native Badges** - Quickdraw, Pair Extraordinaire, Pull Shark, Galaxy Brain, YOLO, Public Sponsor
- **Custom Badges** - Trending Developer, Open Source Hero, Community Builder achievements
- **Real-time Progress** - Track progress towards next level with percentage indicators
- **Points Multipliers** - Higher level achievements grant exponentially more points (1x to 10x)

### ⚡ Power Level System
- **RPG-Style Leveling** - Quadratic progression formula: `cost = 100 + 20n + 3n²`
- **Points Accumulation** - Earn points from achievements, contributions, and GitHub activity
- **Visual Progression** - Clear indicators showing current level, points in level, and next level requirements
- **Exponential Growth** - Later levels require significantly more points, creating long-term goals
- **Prestige Rankings** - Power levels provide universal comparison metric across all users

### 👤 Discord-Style Developer Profiles
- **Rich Profile Cards** - Beautiful, interactive cards with comprehensive GitHub statistics
- **Achievement Showcase** - Display earned badges with rarity indicators and unlock dates
- **Contribution Graphs** - Visual representation of commit history and activity patterns
- **Power Level Display** - Prominent showing of current level and progression bar
- **Stats Dashboard** - Followers, stars, repositories, streaks, languages, and more
- **Social Links** - GitHub profile integration with bio, location, and external links
- **Customizable Themes** - Gaming-inspired dark theme with cyan, amber, and pink accent colors

### 🔍 Advanced Repository Discovery
- **Multi-Filter Search** - Filter by language, stars, forks, topics, license, and more
- **Trending Analysis** - Algorithmic trend scoring based on position, stars, forks, and recency
- **GitHub Trending** - Scrapes official GitHub trending page (daily, weekly, monthly)
- **All-Time Top Repos** - Discover most starred and forked repositories of all time
- **Language-Specific** - Filter trending and top repos by programming language
- **Repository Cards** - Beautiful cards showing description, stats, topics, and metadata
- **Advanced Sorting** - Sort by stars, forks, updated date, or created date
- **Pagination** - Efficient browsing through thousands of repositories

### 🎯 Issue Explorer & Bounty Finder
- **GitHub-Wide Search** - Search issues across all public repositories
- **Advanced Filtering** - Filter by state, labels, language, difficulty, and more
- **Bounty Detection** - Identify issues with labels like "bounty", "paid", "$ reward"
- **Difficulty Sorting** - Find "good first issue", "help wanted", "beginner friendly" issues
- **Real-time Search** - Live results from GitHub API with full-text search
- **Rich Issue Cards** - Display issue title, description, repository, labels, and metadata
- **Direct Links** - Quick access to issues on GitHub for immediate contribution

### 🎓 GSoC Organizations Browser
- **Multi-Year Data** - Historical Google Summer of Code organization data (2020-2024)
- **Organization Profiles** - Detailed information about each participating organization
- **Project Statistics** - Number of projects, technologies, topics, and participation years
- **Interactive Charts** - Visual representation of organization participation over time
- **Category Filtering** - Browse by organization category (Web, Data, Security, etc.)
- **Technology Tags** - Discover organizations by programming languages and frameworks
- **Direct Links** - Access to organization websites, idea lists, and project guides

### 📊 Real-time Analytics & Background Services
- **Automated Updates** - Background service updates user stats every 5 minutes
- **Batch Processing** - Efficient batch updates to minimize API rate limits
- **GraphQL Integration** - Uses GitHub GraphQL API for optimized data fetching
- **Incremental Fetching** - Only fetches changed data since last update
- **Database Optimization** - PostgreSQL with Drizzle ORM for fast queries
- **Session Management** - Automatic leaderboard session creation and rotation
- **Health Monitoring** - Database health checks and analytics endpoints

## 🎯 What Users Can Take Away

### For Developers
- **Motivation to Contribute** - Gamification makes open-source contributions more engaging and rewarding
- **Progress Tracking** - Clear visualization of your GitHub journey and accomplishments
- **Competitive Edge** - Compare your stats with other developers globally
- **Discovery Platform** - Find new repositories, issues, and organizations to contribute to
- **Portfolio Enhancement** - Showcase your achievements and power level on your profile
- **Community Connection** - Join a community of developers striving for excellence

### For Hiring Managers
- **Quantified Skills** - Power levels and achievement tiers provide objective skill assessment
- **Activity Verification** - Real-time GitHub data ensures authenticity of contributions
- **Specialization Indicators** - Achievement categories reveal areas of expertise (languages, open-source, code review, etc.)
- **Consistency Metrics** - Streak achievements show dedication and regular contribution habits
- **Collaboration Skills** - Pair programming and review achievements indicate teamwork ability
- **Community Involvement** - Trending developer and community builder badges show leadership
- **Learning Curve** - Leveled achievements demonstrate skill progression over time
- **Comprehensive Profile** - Single platform showing complete GitHub activity analysis

### For Open Source Projects
- **Contributor Recruitment** - Attract developers looking for new projects to contribute to
- **Issue Visibility** - Get your "good first issue" tasks discovered by eager contributors
- **Bounty Promotion** - Showcase paid opportunities through the issue explorer
- **GSoC Exposure** - Organizations gain visibility through the GSoC browser feature

## 🛠️ Technical Highlights

### Architecture & Design
- **Clean Architecture** - Separation of concerns with services, repositories, and API layers
- **SOLID Principles** - Single responsibility, dependency inversion, and interface segregation
- **Type Safety** - Full TypeScript implementation with comprehensive type definitions
- **Error Handling** - Graceful error recovery with detailed logging and user feedback
- **Performance Optimization** - Caching, pagination, and incremental loading strategies
- **Responsive Design** - Mobile-first approach with beautiful UI across all devices

### Advanced Features
- **Mathematical Formulas** - Sophisticated leveling algorithms for fair progression
- **Real-time Processing** - Background workers for continuous data updates
- **API Rate Limiting** - Smart token management to avoid GitHub API limits
- **Database Indexing** - Optimized queries with strategic indexes for fast lookups
- **Security** - Token encryption, OAuth authentication, and secure session management
- **Scalability** - Designed to handle thousands of concurrent users

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: GitHub OAuth
- **Deployment**: Vercel
- **Analytics**: Vercel Analytics

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── (auth)/           # Auth routes
│   ├── dashboard/        # Dashboard pages
│   └── (marketing)/      # Public pages
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components
│   ├── forms/           # Form components
│   ├── layout/          # Layout components
│   ├── features/        # Feature-specific components
│   └── common/          # Common components
├── lib/                 # Utility libraries and configurations
├── services/            # Business logic and external API calls
│   ├── api/            # API service layer
│   ├── external/       # Third-party integrations
│   └── database/       # Database operations
├── hooks/              # Custom React hooks
├── store/              # State management
├── types/              # TypeScript type definitions
├── contexts/           # React contexts
└── styles/             # Styling files




inpiration from:
my-nextjs-app/
├── .env.local                      # Environment variables
├── .env.example                    # Environment variables example
├── .gitignore
├── .eslintrc.json                  # ESLint configuration
├── .prettierrc                     # Prettier configuration
├── next.config.js                  # Next.js configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
├── package.json
├── README.md
├── middleware.ts                   # Next.js middleware
│
├── public/                         # Static assets
│   ├── images/
│   ├── icons/
│   ├── favicon.ico
│   └── robots.txt
│
├── src/                           # Source code
│   ├── app/                       # App Router (Next.js 13+)
│   │   ├── globals.css            # Global styles
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Home page
│   │   ├── loading.tsx            # Loading UI
│   │   ├── error.tsx              # Error UI
│   │   ├── not-found.tsx          # 404 page
│   │   │
│   │   ├── api/                   # API routes
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── register/
│   │   │   │   │   └── route.ts
│   │   │   │   └── logout/
│   │   │   │       └── route.ts
│   │   │   ├── users/
│   │   │   │   ├── route.ts       # GET /api/users, POST /api/users
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts   # GET, PUT, DELETE /api/users/[id]
│   │   │   ├── products/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   └── webhooks/
│   │   │       └── stripe/
│   │   │           └── route.ts
│   │   │
│   │   ├── (auth)/                # Route groups
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── users/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   └── products/
│   │   │       ├── page.tsx
│   │   │       ├── create/
│   │   │       │   └── page.tsx
│   │   │       └── [id]/
│   │   │           ├── page.tsx
│   │   │           └── edit/
│   │   │               └── page.tsx
│   │   │
│   │   └── (marketing)/           # Public pages
│   │       ├── about/
│   │       │   └── page.tsx
│   │       ├── contact/
│   │       │   └── page.tsx
│   │       └── layout.tsx
│   │
│   ├── components/                # Reusable UI components
│   │   ├── ui/                    # Base UI components (shadcn/ui style)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   ├── form.tsx
│   │   │   ├── toast.tsx
│   │   │   └── index.ts           # Export barrel
│   │   │
│   │   ├── forms/                 # Form components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── ContactForm.tsx
│   │   │   └── ProductForm.tsx
│   │   │
│   │   ├── layout/                # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── Breadcrumbs.tsx
│   │   │
│   │   ├── features/              # Feature-specific components
│   │   │   ├── auth/
│   │   │   │   ├── AuthProvider.tsx
│   │   │   │   ├── LoginButton.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── DashboardStats.tsx
│   │   │   │   ├── UserTable.tsx
│   │   │   │   └── ProductGrid.tsx
│   │   │   └── marketing/
│   │   │       ├── Hero.tsx
│   │   │       ├── Features.tsx
│   │   │       └── Testimonials.tsx
│   │   │
│   │   └── common/                # Common components
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       ├── SEO.tsx
│   │       └── ThemeProvider.tsx
│   │
│   ├── lib/                       # Utility libraries and configurations
│   │   ├── auth.ts                # Authentication configuration
│   │   ├── db.ts                  # Database connection
│   │   ├── validations.ts         # Zod schemas for validation
│   │   ├── utils.ts               # Utility functions
│   │   ├── constants.ts           # Application constants
│   │   ├── env.ts                 # Environment variables validation
│   │   ├── logger.ts              # Logging utility
│   │   ├── email.ts               # Email service configuration
│   │   ├── storage.ts             # File storage configuration
│   │   └── redis.ts               # Redis configuration
│   │
│   ├── services/                  # Business logic and external API calls
│   │   ├── api/                   # API service layer
│   │   │   ├── client.ts          # Base API client (axios/fetch)
│   │   │   ├── auth.service.ts
│   │   │   ├── user.service.ts
│   │   │   ├── product.service.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── external/              # Third-party integrations
│   │   │   ├── stripe.service.ts
│   │   │   ├── sendgrid.service.ts
│   │   │   ├── aws.service.ts
│   │   │   └── analytics.service.ts
│   │   │
│   │   └── database/              # Database operations
│   │       ├── repositories/
│   │       │   ├── base.repository.ts
│   │       │   ├── user.repository.ts
│   │       │   └── product.repository.ts
│   │       └── models/
│   │           ├── user.model.ts
│   │           └── product.model.ts
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useDebounce.ts
│   │   ├── useApi.ts
│   │   ├── usePagination.ts
│   │   └── index.ts
│   │
│   ├── store/                     # State management (Zustand/Redux)
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── userSlice.ts
│   │   │   └── productSlice.ts
│   │   ├── providers/
│   │   │   └── StoreProvider.tsx
│   │   └── index.ts
│   │
│   ├── types/                     # TypeScript type definitions
│   │   ├── api.types.ts
│   │   ├── auth.types.ts
│   │   ├── user.types.ts
│   │   ├── product.types.ts
│   │   ├── database.types.ts
│   │   └── index.ts
│   │
│   ├── contexts/                  # React contexts
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── NotificationContext.tsx
│   │
│   └── styles/                    # Styling files
│       ├── globals.css
│       ├── components.css
│       └── utilities.css
│
├── tests/                         # Test files
│   ├── __mocks__/
│   ├── components/
│   ├── services/
│   ├── hooks/
│   ├── pages/
│   └── setup.ts
│
├── docs/                          # Documentation
│   ├── README.md
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── CONTRIBUTING.md
│
└── scripts/                       # Build and deployment scripts
    ├── build.js
    ├── deploy.js
    └── seed-db.js
```

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd devquest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

4. **Set up the database**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

## API Endpoints

- `GET /api/github/[username]` - Fetch GitHub user profile and stats
- `GET /api/leaderboards` - Get leaderboard data
- `GET /api/issues` - Search GitHub issues
- `GET /api/background-service` - Background service for data updates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request


[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/mohittjees-projects/v0-gamified-git-hub-profiles)

## License

MIT License
