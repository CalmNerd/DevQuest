import { type NextRequest, NextResponse } from "next/server"
import { RepositoryService } from '@/services/api/repository.service'
import { RepositorySearchFilters } from '@/types/github.types'
import { getCurrentUser } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse search parameters
    const filters: RepositorySearchFilters = {
      query: searchParams.get("query") || searchParams.get("q") || "",
      sort: (searchParams.get("sort") as any) || "stars",
      order: (searchParams.get("order") as any) || "desc",
      language: searchParams.get("language") || undefined,
      license: searchParams.get("license") || undefined,
      topic: searchParams.get("topic") || undefined,
      user: searchParams.get("user") || undefined,
      org: searchParams.get("org") || undefined,
      archived: searchParams.get("archived") ? searchParams.get("archived") === "true" : undefined,
      fork: searchParams.get("fork") ? searchParams.get("fork") === "true" : undefined,
      created: searchParams.get("created") || undefined,
      pushed: searchParams.get("pushed") || undefined,
      size: searchParams.get("size") || undefined,
      stars: searchParams.get("stars") || undefined,
      forks: searchParams.get("forks") || undefined,
      page: Number.parseInt(searchParams.get("page") || "1"),
      per_page: Number.parseInt(searchParams.get("per_page") || "10")
    }

    console.log(`[API] Searching repositories with filters:`, filters)

    // Get current user and their GitHub token if available
    const user = await getCurrentUser(request)
    const userToken = user ? user.githubToken : null
    
    if (userToken) {
      console.log(`[API] Using user's GitHub token for repository search`)
    } else {
      console.log(`[API] Using app GitHub token for repository search`)
    }

    // Check if any GitHub token is available
    if (!userToken && !process.env.GITHUB_TOKEN) {
      console.error("No GitHub token available")
      return NextResponse.json(
        { error: "GitHub token not configured. Please contact the administrator." }, 
        { status: 503 }
      )
    }

    try {
      // Create repository service with user token if available
      const repositoryService = new RepositoryService(userToken || undefined)
      const response = await repositoryService.searchRepositories(filters)
      
      // Add pagination metadata
      const totalCount = response.total_count || 0
      const totalPages = Math.ceil(totalCount / filters.per_page!)
      const hasNextPage = filters.page! < totalPages
      const hasPrevPage = filters.page! > 1
      
      const enhancedResponse = {
        ...response,
        pagination: {
          current_page: filters.page,
          per_page: filters.per_page,
          total_count: totalCount,
          total_pages: totalPages,
          has_next_page: hasNextPage,
          has_prev_page: hasPrevPage,
          next_page: hasNextPage ? filters.page! + 1 : null,
          prev_page: hasPrevPage ? filters.page! - 1 : null
        }
      }
      
      console.log(`[API] Successfully fetched ${response.items?.length || 0} repositories (page ${filters.page}/${totalPages})`)
      return NextResponse.json(enhancedResponse)
    } catch (error) {
      console.error("Error fetching repositories from GitHub API:", error)
      
      // Log detailed error information for debugging
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          filters: filters
        })
      }
      
      // Return error response with helpful message
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
      
      // Return more detailed error information
      return NextResponse.json(
        { 
          error: "Failed to fetch repositories from GitHub API",
          details: error instanceof Error ? error.message : "Unknown error",
          debug: {
            query: filters.query,
            filters: filters,
            timestamp: new Date().toISOString()
          }
        }, 
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error in repositories API route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
