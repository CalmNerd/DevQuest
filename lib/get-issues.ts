import axios from "axios"

interface GetUserDetailsInput {
  owner: string
  repo: string
  issueNumber: number
}

export const getIssues = async (query: string, page: string, perPage: string = "10") => {
  const token = process.env.GITHUB_TOKEN
  
  if (!token) {
    throw new Error("GitHub token is required. Please set GITHUB_TOKEN environment variable.")
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

export const getIssueDetails = async (payload: GetUserDetailsInput) => {
  const token = process.env.GITHUB_TOKEN
  
  if (!token) {
    throw new Error("GitHub token is required. Please set GITHUB_TOKEN environment variable.")
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
