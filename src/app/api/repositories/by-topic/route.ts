import { type NextRequest, NextResponse } from "next/server"
import { repositoryService } from '@/services/api/repository.service'
import { mockRepositories } from '@/lib/constants'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const topic = searchParams.get("topic") || ""
    const limit = Number.parseInt(searchParams.get("limit") || "30")

    if (!topic) {
      return NextResponse.json(
        { error: "Topic parameter is required" },
        { status: 400 }
      )
    }

    // Check if GitHub token is available
    if (!process.env.GITHUB_TOKEN) {
      console.warn("GitHub token not found, returning mock data")
      const filteredMockRepos = mockRepositories.filter(repo =>
        repo.topics?.includes(topic) ||
        repo.name.toLowerCase().includes(topic.toLowerCase()) ||
        repo.description?.toLowerCase().includes(topic.toLowerCase())
      )

      return NextResponse.json({
        repositories: filteredMockRepos.slice(0, limit),
        topic,
        total_count: filteredMockRepos.length
      })
    }

    try {
      const repositories = await repositoryService.getRepositoriesByTopic(topic)

      const response = {
        repositories: repositories.slice(0, limit),
        topic,
        total_count: repositories.length,
        generated_at: new Date().toISOString()
      }

      console.log(`[API] Successfully fetched ${repositories.length} repositories for topic: ${topic}`)
      return NextResponse.json(response)
    } catch (error) {
      console.error("Error fetching repositories by topic from GitHub API:", error)
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

      if (error instanceof Error && error.message.includes("422")) {
        return NextResponse.json(
          { error: "Invalid search query" },
          { status: 422 }
        )
      }

      return NextResponse.json(
        { error: "Failed to fetch repositories by topic from GitHub API" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error in repositories by topic API route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
