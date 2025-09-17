import { type NextRequest, NextResponse } from "next/server"
import { githubService } from "@/lib/github-service"

export async function GET(request: NextRequest, { params }: { params: { owner: string; repo: string } }) {
  try {
    const { owner, repo } = params
    const { searchParams } = new URL(request.url)
    const includeStats = searchParams.get("include_stats") === "true"

    console.log(`[API] Fetching repository: ${owner}/${repo}`)

    if (!owner || !repo) {
      return NextResponse.json({ error: "Owner and repository name are required" }, { status: 400 })
    }

    // Check if GitHub token is available
    if (!process.env.GITHUB_TOKEN) {
      console.warn("GitHub token not found, returning mock data")
      
      // Return mock repository data
      const mockRepo = {
        id: 12345,
        name: repo,
        full_name: `${owner}/${repo}`,
        owner: {
          login: owner,
          id: 1,
          avatar_url: "https://avatars.githubusercontent.com/u/1?v=4",
          html_url: `https://github.com/${owner}`,
          type: "User"
        },
        html_url: `https://github.com/${owner}/${repo}`,
        description: "A sample repository for demonstration purposes",
        homepage: null,
        language: "TypeScript",
        languages_url: `https://api.github.com/repos/${owner}/${repo}/languages`,
        stargazers_count: 150,
        watchers_count: 150,
        forks_count: 25,
        open_issues_count: 12,
        license: {
          key: "mit",
          name: "MIT License",
          spdx_id: "MIT",
          url: "https://api.github.com/licenses/mit"
        },
        topics: ["typescript", "react", "nextjs"],
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2024-01-15T10:30:00Z",
        pushed_at: "2024-01-15T10:30:00Z",
        size: 1024,
        default_branch: "main",
        visibility: "public",
        archived: false,
        disabled: false,
        fork: false,
        has_issues: true,
        has_projects: true,
        has_wiki: true,
        has_pages: false,
        has_downloads: true,
        allow_forking: true,
        is_template: false,
        web_commit_signoff_required: false,
        clone_url: `https://github.com/${owner}/${repo}.git`,
        ssh_url: `git@github.com:${owner}/${repo}.git`,
        svn_url: `https://github.com/${owner}/${repo}`,
        git_url: `git://github.com/${owner}/${repo}.git`,
        git_refs_url: `https://api.github.com/repos/${owner}/${repo}/git/refs{/sha}`,
        trees_url: `https://api.github.com/repos/${owner}/${repo}/git/trees{/sha}`,
        statuses_url: `https://api.github.com/repos/${owner}/${repo}/statuses/{sha}`,
        languages_url: `https://api.github.com/repos/${owner}/${repo}/languages`,
        stargazers_url: `https://api.github.com/repos/${owner}/${repo}/stargazers`,
        contributors_url: `https://api.github.com/repos/${owner}/${repo}/contributors`,
        subscribers_url: `https://api.github.com/repos/${owner}/${repo}/subscribers`,
        subscription_url: `https://api.github.com/repos/${owner}/${repo}/subscription`,
        commits_url: `https://api.github.com/repos/${owner}/${repo}/commits{/sha}`,
        git_commits_url: `https://api.github.com/repos/${owner}/${repo}/git/commits{/sha}`,
        comments_url: `https://api.github.com/repos/${owner}/${repo}/comments{/number}`,
        issue_comment_url: `https://api.github.com/repos/${owner}/${repo}/issues/comments{/number}`,
        contents_url: `https://api.github.com/repos/${owner}/${repo}/contents/{+path}`,
        compare_url: `https://api.github.com/repos/${owner}/${repo}/compare/{base}...{head}`,
        merges_url: `https://api.github.com/repos/${owner}/${repo}/merges`,
        archive_url: `https://api.github.com/repos/${owner}/${repo}/{archive_format}{/ref}`,
        downloads_url: `https://api.github.com/repos/${owner}/${repo}/downloads`,
        issues_url: `https://api.github.com/repos/${owner}/${repo}/issues{/number}`,
        pulls_url: `https://api.github.com/repos/${owner}/${repo}/pulls{/number}`,
        milestones_url: `https://api.github.com/repos/${owner}/${repo}/milestones{/number}`,
        notifications_url: `https://api.github.com/repos/${owner}/${repo}/notifications{?since,all,participating}`,
        labels_url: `https://api.github.com/repos/${owner}/${repo}/labels{/name}`,
        releases_url: `https://api.github.com/repos/${owner}/${repo}/releases{/id}`,
        deployments_url: `https://api.github.com/repos/${owner}/${repo}/deployments`,
        permissions: {
          admin: false,
          maintain: false,
          push: false,
          triage: false,
          pull: true
        }
      }

      return NextResponse.json(mockRepo)
    }

    // Use real GitHub API
    try {
      const repoData = await githubService.fetchRepositoryDetails(`${owner}/${repo}`)
      
      if (!repoData) {
        return NextResponse.json({ error: "Repository not found" }, { status: 404 })
      }

      // Fetch languages for the repository
      let languages = {}
      try {
        const languagesResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, {
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            Accept: "application/vnd.github+json",
            "User-Agent": "GitRank",
          },
        })
        if (languagesResponse.ok) {
          languages = await languagesResponse.json()
        }
      } catch (error) {
        console.warn("Failed to fetch languages:", error)
      }

      const response = {
        ...repoData,
        languages
      }

      console.log(`[API] Successfully fetched repository: ${owner}/${repo}`)
      return NextResponse.json(response)
    } catch (error) {
      console.error("Error fetching repository from GitHub API:", error)
      
      // Return error response with helpful message
      if (error instanceof Error && error.message.includes("404")) {
        return NextResponse.json(
          { error: "Repository not found" }, 
          { status: 404 }
        )
      }
      
      if (error instanceof Error && error.message.includes("401")) {
        return NextResponse.json(
          { error: "Unauthorized: Invalid GitHub token" }, 
          { status: 401 }
        )
      }
      
      if (error instanceof Error && error.message.includes("403")) {
        return NextResponse.json(
          { error: "Rate limit exceeded or insufficient permissions" }, 
          { status: 403 }
        )
      }
      
      return NextResponse.json(
        { error: "Failed to fetch repository from GitHub API" }, 
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error in repository API route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
