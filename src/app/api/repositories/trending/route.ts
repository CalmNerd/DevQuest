import { type NextRequest, NextResponse } from "next/server"
import { repositoryService } from '@/services/api/repository.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "stars" // stars, forks, language
    const period = (searchParams.get("period") as 'daily' | 'weekly' | 'monthly' | 'yearly' | '2024' | '2023' | '2022' | '2021' | '2020') || "weekly"
    const language = searchParams.get("language") || undefined
    const limit = Number.parseInt(searchParams.get("limit") || "30")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const sort = (searchParams.get("sort") as 'stars' | 'forks' | 'updated' | 'created') || "stars"

    console.log(`[API] Fetching trending repositories - type: ${type}, period: ${period}, language: ${language}`)

    // Check if GitHub token is available
    if (!process.env.GITHUB_TOKEN) {
      console.error("GitHub token not found")
      return NextResponse.json(
        { error: "GitHub token not configured. Please contact the administrator." },
        { status: 503 }
      )
    }

    try {
      let repositories: any[] = []

      switch (type) {
        case "stars":
          repositories = await repositoryService.getTrendingByStars(period, page, limit, language)
          break
        case "forks":
          repositories = await repositoryService.getTrendingByForks(period, page, limit, language)
          break
        case "all-time":
          repositories = await repositoryService.getAllTimeTopRepositories(language, sort, page, limit)
          break
        default:
          repositories = await repositoryService.getTrendingByStars(period, page, limit, language)
      }

      // Sort by trend score if available
      if (repositories.length > 0 && repositories[0].trend_score !== undefined) {
        repositories.sort((a, b) => b.trend_score - a.trend_score)
      }

      // For GitHub API responses, we need to estimate total count since GitHub doesn't provide it for trending
      // We'll use a reasonable estimate based on the current page and results
      const estimatedTotalCount = repositories.length < limit ?
        ((page - 1) * limit) + repositories.length :
        ((page - 1) * limit) + repositories.length + (repositories.length === limit ? limit : 0)

      const totalPages = Math.ceil(estimatedTotalCount / limit)

      const response = {
        repositories: repositories,
        type,
        period,
        language,
        total_count: estimatedTotalCount,
        totalPages,
        currentPage: page,
        hasNextPage: repositories.length === limit, // If we got exactly the limit, there might be more
        hasPrevPage: page > 1,
        generated_at: new Date().toISOString()
      }

      console.log(`[API] Successfully fetched ${repositories.length} trending repositories`)
      return NextResponse.json(response)
    } catch (error) {
      console.error("Error fetching trending repositories from GitHub API:", error)
      
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
        { error: "Failed to fetch trending repositories from GitHub API" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error in trending repositories API route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
