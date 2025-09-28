import { type NextRequest, NextResponse } from "next/server"
import { getIssues } from '@/services/api/issues.service'
import { mockIssues } from '@/lib/constants'
import { getCurrentUser, getUserGitHubToken } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const state = searchParams.get("state") || "open"
    const language = searchParams.get("language") || ""
    const label = searchParams.get("label") || ""
    const sort = searchParams.get("sort") || "created"
    const order = searchParams.get("order") || "desc"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const perPage = Number.parseInt(searchParams.get("per_page") || "10")

    // Build GitHub search query
    let searchQuery = query
    if (state !== "all") searchQuery += ` state:${state}`
    if (language && language !== "all") searchQuery += ` language:${language}`
    if (label) searchQuery += ` label:"${label}"`

    // Get current user and their GitHub token if available
    const user = await getCurrentUser(request)
    const userToken = user ? await getUserGitHubToken(user.id) : null
    
    if (userToken) {
      console.log(`[API] Using user's GitHub token for issue search`)
    } else {
      console.log(`[API] Using app GitHub token for issue search`)
    }

    // Check if any GitHub token is available
    if (!userToken && !process.env.GITHUB_TOKEN) {
      console.warn("No GitHub token available, returning mock data")
      return NextResponse.json({
        total_count: mockIssues.length,
        incomplete_results: false,
        items: mockIssues,
      })
    }

    // Use real GitHub API
    try {
      console.log(`[API] Fetching issues with query: "${searchQuery}", page: ${page}, per_page: ${perPage}`)
      const issues = await getIssues(searchQuery, page.toString(), perPage.toString(), userToken || undefined)
      
      // Add pagination metadata
      const totalCount = issues.total_count || 0
      const totalPages = Math.ceil(totalCount / perPage)
      const hasNextPage = page < totalPages
      const hasPrevPage = page > 1
      
      const response = {
        ...issues,
        pagination: {
          current_page: page,
          per_page: perPage,
          total_count: totalCount,
          total_pages: totalPages,
          has_next_page: hasNextPage,
          has_prev_page: hasPrevPage,
          next_page: hasNextPage ? page + 1 : null,
          prev_page: hasPrevPage ? page - 1 : null
        }
      }
      
      console.log(`[API] Successfully fetched ${issues.items?.length || 0} issues (page ${page}/${totalPages})`)
      return NextResponse.json(response)
    } catch (error) {
      console.error("Error fetching issues from GitHub API:", error)
      
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
      
      return NextResponse.json(
        { error: "Failed to fetch issues from GitHub API" }, 
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error in issues API route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
