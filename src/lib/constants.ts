import { GitHubIssue } from '@/types/github.types';

// Mock data for fallback
export const mockIssues: GitHubIssue[] = [
    {
        id: 1,
        number: 42,
        title: "Add dark mode support to the dashboard",
        body: "Users have been requesting dark mode support. This would improve accessibility and user experience...",
        state: "open",
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-16T14:20:00Z",
        comments: 8,
        labels: [
            { name: "enhancement", color: "a2eeef" },
            { name: "good first issue", color: "7057ff" },
            { name: "help wanted", color: "008672" },
        ],
        user: {
            login: "developer123",
            avatar_url: "/placeholder.svg?height=40&width=40",
        },
        assignees: [
            { login: "developer123", avatar_url: "/placeholder.svg?height=40&width=40", id: 1 },
            { login: "designer456", avatar_url: "/placeholder.svg?height=40&width=40", id: 2 }
        ],
        repository: {
            name: "awesome-dashboard",
            full_name: "company/awesome-dashboard",
            owner: { login: "company" },
            stargazers_count: 1250,
            forks_count: 89,
            watchers_count: 1250,
            subscribers_count: 1250,
            open_issues_count: 12,
            language: "TypeScript",
            languages: ["TypeScript", "JavaScript", "CSS"],
            avatar_url: "/placeholder.svg?height=40&width=40"
        },
        html_url: "https://github.com/company/awesome-dashboard/issues/42",
    },
    {
        id: 2,
        number: 156,
        title: "Performance optimization for large datasets",
        body: "The application becomes slow when handling datasets with more than 10k records...",
        state: "open",
        created_at: "2024-01-14T09:15:00Z",
        updated_at: "2024-01-15T16:45:00Z",
        comments: 12,
        labels: [
            { name: "performance", color: "d73a49" },
            { name: "bug", color: "d73a49" },
            { name: "priority: high", color: "b60205" },
        ],
        user: {
            login: "performance-guru",
            avatar_url: "/placeholder.svg?height=40&width=40",
        },
        assignees: [
            { login: "performance-guru", avatar_url: "/placeholder.svg?height=40&width=40", id: 3 }
        ],
        repository: {
            name: "data-processor",
            full_name: "startup/data-processor",
            owner: { login: "startup" },
            stargazers_count: 890,
            forks_count: 45,
            watchers_count: 890,
            subscribers_count: 890,
            open_issues_count: 8,
            language: "Python",
            languages: ["Python", "Dockerfile"],
            avatar_url: "/placeholder.svg?height=40&width=40"
        },
        html_url: "https://github.com/startup/data-processor/issues/156",
    },
    {
        id: 3,
        number: 23,
        title: "Add support for custom themes",
        body: "Allow users to create and share custom themes for better personalization...",
        state: "open",
        created_at: "2024-01-13T14:22:00Z",
        updated_at: "2024-01-14T11:30:00Z",
        comments: 5,
        labels: [
            { name: "feature request", color: "a2eeef" },
            { name: "ui/ux", color: "0052cc" },
            { name: "good first issue", color: "7057ff" },
        ],
        user: {
            login: "designer-dev",
            avatar_url: "/placeholder.svg?height=40&width=40",
        },
        assignees: [],
        repository: {
            name: "theme-engine",
            full_name: "opensource/theme-engine",
            owner: { login: "opensource" },
            stargazers_count: 2100,
            forks_count: 156,
            watchers_count: 2100,
            subscribers_count: 2100,
            open_issues_count: 23,
            language: "JavaScript",
            languages: ["JavaScript", "HTML", "CSS"],
            avatar_url: "/placeholder.svg?height=40&width=40"
        },
        html_url: "https://github.com/opensource/theme-engine/issues/23",
    },
]

export const popularLanguages = [
    "JavaScript", "TypeScript", "Python", "Java", "C++", "C", "C#", "Go", "Rust",
    "PHP", "Ruby", "Swift", "Kotlin", "Dart", "R", "MATLAB", "Scala", "Perl",
    "Haskell", "Clojure", "Elixir", "Erlang", "Julia", "Lua", "Shell", "PowerShell",
    "Assembly", "Objective-C", "Vue", "React", "Angular", "Node.js", "HTML", "CSS",
    "SCSS", "Sass", "Less", "JSON", "YAML", "XML", "Markdown", "Dockerfile"
]
export const commonLabels = ["good first issue","💎 Bounty", "help wanted", "GSoC2025", "bug", "enhancement", "documentation"]
