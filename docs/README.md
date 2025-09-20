# DevQuest - Gamified GitHub Profiles

## Overview

DevQuest is a Next.js application that gamifies GitHub profiles by creating competitive leaderboards, achievement systems, and Discord-style profile cards for developers.

## Features

- 🏆 **Dynamic Leaderboards** - Compete on daily, weekly, monthly, and yearly contribution leaderboards
- 🎖️ **Achievement Badges** - Earn unique badges for milestones, streaks, and special accomplishments  
- 👤 **Discord-Style Profiles** - Rich, interactive profile cards with GitHub stats and achievements
- 🔍 **Issue Explorer** - Discover and filter GitHub issues across repositories and organizations
- 📊 **Real-time Analytics** - Live updates and comprehensive GitHub statistics

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
