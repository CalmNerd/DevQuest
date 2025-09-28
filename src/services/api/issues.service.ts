import axios from "axios"
import { tokenEncryption } from '@/lib/encryption'

interface GetUserDetailsInput {
  owner: string
  repo: string
  issueNumber: number
}

export const getIssues = async (query: string, page: string, perPage: string = "10", userToken?: string) => {
  // Use user token if provided, otherwise fall back to app token
  let token = userToken || process.env.GITHUB_TOKEN

  // If user token is encrypted, decrypt it
  if (userToken && tokenEncryption.isEncrypted(userToken)) {
    try {
      token = tokenEncryption.decryptToken(userToken)
    } catch (error) {
      console.warn('Failed to decrypt user token, falling back to app token:', error)
      token = process.env.GITHUB_TOKEN
    }
  }
  
  if (!token) {
    throw new Error("GitHub token is required. Please set GITHUB_TOKEN environment variable or provide user token.")
  }

  const response = await axios.get(`https://api.github.com/search/issues?q=${query}&page=${page}&per_page=${perPage}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "DevQuest",
    },
  })
  return response.data
}

export const getIssueDetails = async (payload: GetUserDetailsInput, userToken?: string) => {
  // Use user token if provided, otherwise fall back to app token
  let token = userToken || process.env.GITHUB_TOKEN

  // If user token is encrypted, decrypt it
  if (userToken && tokenEncryption.isEncrypted(userToken)) {
    try {
      token = tokenEncryption.decryptToken(userToken)
    } catch (error) {
      console.warn('Failed to decrypt user token, falling back to app token:', error)
      token = process.env.GITHUB_TOKEN
    }
  }
  
  if (!token) {
    throw new Error("GitHub token is required. Please set GITHUB_TOKEN environment variable or provide user token.")
  }

  const res = await axios.get(
    `https://api.github.com/repos/${payload.owner}/${payload.repo}/issues/${payload.issueNumber}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "DevQuest",
      },
    },
  )

  if (res.status !== 200) throw new Error(`GitHub API error: ${res.status}`)
  return res.data
}

export const issuesService = {
  getIssues,
  getIssueDetails,
}
