"use client"

import { Suspense, useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeftRight, Crown, ExternalLink, Minus, Swords, Trophy } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Header from "@/components/layout/Header"
import Loader from "@/components/ui/loader"
import { cn, isValidGitHubUsername } from "@/lib/utils"
import type { CompareProfileSummary, CompareResponse } from "@/types/github.types"

type Side = "a" | "b"

function ProfileCard({ profile, isWinner }: { profile: CompareProfileSummary; isWinner: boolean }) {
  return (
    <Card className={cn("h-full transition-colors", isWinner && "border-primary")}>
      <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
        <Avatar className="h-20 w-20">
          <AvatarImage src={profile.avatar_url} alt={profile.login} />
          <AvatarFallback>{profile.login.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>

        <div>
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-lg font-semibold">{profile.name || profile.login}</h2>
            {isWinner && <Crown className="h-4 w-4 text-primary" aria-label="Winner" />}
          </div>
          <a
            href={profile.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            @{profile.login}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge variant="secondary">Power {profile.powerLevel}</Badge>
          <Badge variant="outline">{profile.points.toLocaleString()} pts</Badge>
        </div>
      </CardContent>
    </Card>
  )
}

function MetricRow({ metric }: { metric: CompareResponse["metrics"][number] }) {
  const cellClass = (side: Side) =>
    cn(
      "flex-1 rounded-md px-3 py-2 text-center tabular-nums",
      metric.winner === side ? "bg-primary/10 font-semibold text-foreground" : "text-muted-foreground",
    )

  return (
    <div className="flex items-center gap-2 border-b border-border py-2 last:border-0">
      <div className={cellClass("a")}>
        <div>{metric.a.value.toLocaleString()}</div>
        <div className="text-xs opacity-70">Lv {metric.a.level}</div>
      </div>

      <div className="w-32 shrink-0 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground sm:w-40">
        {metric.label}
        {metric.winner === "tie" && <Minus className="mx-auto mt-1 h-3 w-3" aria-label="Tied" />}
      </div>

      <div className={cellClass("b")}>
        <div>{metric.b.value.toLocaleString()}</div>
        <div className="text-xs opacity-70">Lv {metric.b.level}</div>
      </div>
    </div>
  )
}

function Verdict({ result }: { result: CompareResponse }) {
  const { winner, wins } = result
  const champion = winner === "tie" ? null : result[winner]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card/50 p-6 text-center"
    >
      <Trophy className="h-6 w-6 text-primary" />
      <h2 className="text-xl font-semibold">
        {champion ? `@${champion.login} wins` : "It's a dead heat"}
      </h2>
      <p className="text-sm text-muted-foreground">
        {`@${result.a.login} ${wins.a} — ${wins.b} @${result.b.login}`}
        {wins.ties > 0 && ` (${wins.ties} tied)`}
      </p>
    </motion.div>
  )
}

function CompareView() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [a, setA] = useState(searchParams.get("a") ?? "")
  const [b, setB] = useState(searchParams.get("b") ?? "")
  const [result, setResult] = useState<CompareResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runCompare = useCallback(async (left: string, right: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/compare?a=${encodeURIComponent(left)}&b=${encodeURIComponent(right)}`)

      // A server-side crash renders an HTML error page, so parsing is not safe
      // to assume; surface something readable instead of a JSON syntax error.
      const body = await response.json().catch(() => null)

      if (!body) {
        throw new Error(`Comparison failed (HTTP ${response.status})`)
      }
      if (!response.ok || !body.success) {
        throw new Error(body.error || "Failed to compare profiles")
      }

      setResult(body.data as CompareResponse)
    } catch (err) {
      setResult(null)
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }, [])

  // Drives off the URL so a comparison can be linked and shared.
  useEffect(() => {
    const left = searchParams.get("a")?.trim()
    const right = searchParams.get("b")?.trim()
    if (left && right) {
      runCompare(left, right)
    }
  }, [searchParams, runCompare])

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const left = a.trim()
    const right = b.trim()

    if (!left || !right) {
      return setError("Enter two GitHub usernames")
    }
    if (!isValidGitHubUsername(left) || !isValidGitHubUsername(right)) {
      return setError("That doesn't look like a GitHub username")
    }
    if (left.toLowerCase() === right.toLowerCase()) {
      return setError("Pick two different users")
    }

    setError(null)
    router.push(`/compare?a=${encodeURIComponent(left)}&b=${encodeURIComponent(right)}`)
  }

  const swap = () => {
    setA(b)
    setB(a)
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="flex items-center justify-center gap-2 text-3xl font-bold">
          <Swords className="h-7 w-7 text-primary" />
          Compare Developers
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Put two GitHub profiles head to head, scored on the same levels DevQuest uses everywhere else.
        </p>
      </div>

      <form onSubmit={submit} className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={a}
          onChange={(event) => setA(event.target.value)}
          placeholder="First username"
          aria-label="First GitHub username"
          autoComplete="off"
        />

        <Button type="button" variant="ghost" size="icon" onClick={swap} aria-label="Swap usernames">
          <ArrowLeftRight className="h-4 w-4" />
        </Button>

        <Input
          value={b}
          onChange={(event) => setB(event.target.value)}
          placeholder="Second username"
          aria-label="Second GitHub username"
          autoComplete="off"
        />

        <Button type="submit" disabled={loading}>
          {loading ? "Comparing..." : "Compare"}
        </Button>
      </form>

      {error && (
        <p role="alert" className="mb-6 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-center text-sm">
          {error}
        </p>
      )}

      {loading && <Loader title="Comparing profiles..." subtitles={["Fetching both GitHub profiles...", "Scoring each category..."]} />}

      {!loading && result && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ProfileCard profile={result.a} isWinner={result.winner === "a"} />
            <ProfileCard profile={result.b} isWinner={result.winner === "b"} />
          </div>

          <Verdict result={result} />

          <Card>
            <CardContent className="p-4 sm:p-6">
              {result.metrics.map((metric) => (
                <MetricRow key={metric.category} metric={metric} />
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {!loading && !result && !error && (
        <p className="text-center text-sm text-muted-foreground">
          Try{" "}
          <Link href="/compare?a=torvalds&b=gaearon" className="underline hover:text-foreground">
            torvalds vs gaearon
          </Link>
          .
        </p>
      )}
    </div>
  )
}

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Suspense fallback={<Loader title="Loading comparison..." />}>
        <CompareView />
      </Suspense>
    </div>
  )
}
