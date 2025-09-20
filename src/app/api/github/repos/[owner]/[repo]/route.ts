import { type NextRequest, NextResponse } from "next/server"
import { githubService } from '@/services/external/github.service'

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
      return NextResponse.json({ error: "GitHub token not found" }, { status: 400 })
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
            "User-Agent": "DevQuest",
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
