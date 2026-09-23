"use client"

import { Suspense, useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ArrowLeftRight, Crown, Minus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Header from "@/components/layout/Header"
import Loader from "@/components/ui/loader"
import { cn, isValidGitHubUsername } from "@/lib/utils"
import type { CompareProfileSummary, CompareResponse } from "@/types/github.types"

type Side = "a" | "b"
type FighterState = "idle" | "ready" | "won" | "lost" | "tie"

const LEFT_CLIP = "polygon(0 0, 56% 0, 44% 100%, 0 100%)"
const RIGHT_CLIP = "polygon(56% 0, 100% 0, 100% 100%, 44% 100%)"
const EASE_OUT = [0.2, 0.8, 0.2, 1] as const

// Seeded rather than Math.random so the server and client draw the same first bolt.
const noise = (i: number, seed: number) => {
  const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453
  return x - Math.floor(x)
}

function boltPoints(seed: number, amp: number) {
  const top: string[] = []
  const bottom: string[] = []
  for (let i = 0; i <= 50; i++) {
    const x = i * 20
    const spikeUp = noise(i, seed) > 0.8 ? noise(i + 99, seed) * 30 : 0
    const spikeDown = noise(i + 7, seed) > 0.85 ? noise(i + 51, seed) * 24 : 0
    top.push(`${x},${60 - (2 + noise(i + 3, seed) * 6 + spikeUp) * amp}`)
    bottom.unshift(`${x},${60 + (2 + noise(i + 5, seed) * 6 + spikeDown) * amp}`)
  }
  return [...top, ...bottom].join(" ")
}

function Lightning({ amp }: { amp: number }) {
  const reduceMotion = useReducedMotion()
  const [seed, setSeed] = useState(1)

  useEffect(() => {
    if (reduceMotion) return
    const id = setInterval(() => setSeed((s) => s + 1), 110)
    return () => clearInterval(id)
  }, [reduceMotion])

  return (
    <svg
      viewBox="0 0 1000 120"
      preserveAspectRatio="none"
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-1/2 h-20 w-full -translate-y-1/2 [filter:drop-shadow(0_0_6px_#fff)_drop-shadow(0_0_18px_rgba(255,255,255,0.7))] sm:h-28"
    >
      <polygon points={boltPoints(seed, amp)} fill="#fff" />
    </svg>
  )
}

const SPARKS = [
  { top: "18%", left: "6%", width: 14, delay: 0 },
  { top: "72%", left: "10%", width: 8, delay: 0.8 },
  { top: "30%", left: "38%", width: 6, delay: 1.6 },
  { top: "80%", left: "62%", width: 12, delay: 0.4 },
  { top: "24%", left: "78%", width: 8, delay: 1.2 },
  { top: "64%", left: "90%", width: 14, delay: 2 },
]

function Sparks() {
  return SPARKS.map((spark, i) => (
    <motion.span
      key={i}
      aria-hidden
      className="absolute h-1 rounded-full bg-white/80"
      style={{ top: spark.top, left: spark.left, width: spark.width }}
      animate={{ x: [0, 36], opacity: [0, 1, 0] }}
      transition={{ duration: 2.4, repeat: Infinity, delay: spark.delay, ease: "easeOut" }}
    />
  ))
}

function Fighter({ side, login, state }: { side: Side; login?: string; state: FighterState }) {
  const won = state === "won"
  const waiting = state === "idle" || state === "ready"

  return (
    <div className="relative mx-auto flex h-20 w-20 items-center justify-center sm:h-32 sm:w-32">
      <motion.span
        aria-hidden
        className={cn("absolute h-[135%] w-[135%] rounded-full border-2", won ? "border-yellow-200/80" : "border-white/40")}
        animate={waiting ? { scale: [1, 1.2], opacity: [0.7, 0] } : { scale: 1, opacity: won ? 1 : 0 }}
        transition={waiting ? { duration: 1.6, repeat: Infinity, ease: "easeOut" } : { duration: 0.4 }}
      />

      <AnimatePresence>
        {won && (
          <motion.div
            className="absolute -top-10 z-10 sm:-top-12"
            initial={{ y: 12, opacity: 0, scale: 0.3 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 12, delay: 0.35 }}
          >
            <Crown className="h-8 w-8 fill-yellow-300 text-yellow-500 drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)] sm:h-10 sm:w-10" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={login ?? "unknown"}
          initial={{ scale: 0, rotate: side === "a" ? -30 : 30 }}
          animate={{ scale: won ? 1.1 : state === "lost" ? 0.9 : 1, rotate: 0 }}
          exit={{ scale: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 16 }}
        >
          <Avatar
            className={cn(
              "h-20 w-20 border-4 border-white shadow-xl transition-[filter,box-shadow,border-color] duration-500 sm:h-32 sm:w-32",
              won && "border-yellow-300 shadow-[0_0_40px_rgba(253,224,71,0.9)]",
              state === "lost" && "brightness-75 grayscale",
            )}
          >
            {login && <AvatarImage src={`https://github.com/${encodeURIComponent(login)}.png?size=256`} alt={login} />}
            <AvatarFallback
              className={cn(
                "text-4xl font-black text-[#fff1d6] sm:text-6xl",
                side === "a" ? "bg-gradient-to-br from-[#ff4d3d] to-[#ffa05a]" : "bg-gradient-to-br from-[#2f6bff] to-[#5cc8ff]",
              )}
            >
              ?
            </AvatarFallback>
          </Avatar>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function Nameplate({
  login,
  profile,
  state,
  loading,
}: {
  login?: string
  profile?: CompareProfileSummary
  state: FighterState
  loading: boolean
}) {
  return (
    <motion.div
      layout
      className={cn(
        "flex min-w-0 max-w-full flex-col items-center rounded-xl bg-black/25 px-3 py-2 text-center text-white backdrop-blur-sm transition-opacity sm:px-5",
        state === "lost" && "opacity-60",
      )}
    >
      {!login ? (
        <span className="animate-pulse text-xs font-semibold tracking-wide sm:text-sm">Searching...</span>
      ) : (
        <>
          {profile ? (
            <a
              href={profile.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="max-w-full truncate text-sm font-bold hover:underline sm:text-base"
            >
              {profile.name || `@${profile.login}`}
            </a>
          ) : (
            <span className="max-w-full truncate text-sm font-bold sm:text-base">@{login}</span>
          )}
          {profile ? (
            <span className="text-[11px] text-white/80 sm:text-xs">
              Power {profile.powerLevel} · {profile.points.toLocaleString()} pts
            </span>
          ) : (
            loading && <span className="animate-pulse text-[11px] text-white/80 sm:text-xs">Scoring...</span>
          )}
        </>
      )}
      {state === "won" && (
        <span className="mt-1 rounded-full bg-yellow-300 px-2 text-[10px] font-black uppercase tracking-widest text-yellow-900">
          Winner
        </span>
      )}
    </motion.div>
  )
}

function VersusArena({
  left,
  right,
  loading,
  error,
  result,
}: {
  left?: string
  right?: string
  loading: boolean
  error: string | null
  result: CompareResponse | null
}) {
  const settled = loading ? null : result

  const stateOf = (side: Side): FighterState => {
    if (!(side === "a" ? left : right)) return "idle"
    if (!settled) return "ready"
    if (settled.winner === "tie") return "tie"
    return settled.winner === side ? "won" : "lost"
  }

  const loser: Side | null = settled && settled.winner !== "tie" ? (settled.winner === "a" ? "b" : "a") : null

  const title = settled
    ? settled.winner === "tie"
      ? "Dead Heat!"
      : `@${settled[settled.winner].login} Wins!`
    : error && left && right
      ? "No Contest"
      : left && right
        ? "Opponent Found!"
        : "Find Your Opponent"

  return (
    <section className="relative mb-8 overflow-hidden rounded-2xl shadow-2xl">
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-[#ff3d3d] via-[#f5543e] to-[#ffb06b]"
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        transition={{ duration: 0.6, ease: EASE_OUT }}
      />
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-bl from-[#2a6bff] via-[#3d8dff] to-[#8fe0ff]"
        style={{ clipPath: RIGHT_CLIP }}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        transition={{ duration: 0.6, ease: EASE_OUT }}
      />
      <AnimatePresence>
        {loser && (
          <motion.div
            key={loser}
            aria-hidden
            className="absolute inset-0 bg-black"
            style={{ clipPath: loser === "a" ? LEFT_CLIP : RIGHT_CLIP }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          />
        )}
      </AnimatePresence>
      <Sparks />

      <div className="relative flex flex-col items-center gap-6 px-4 py-8 sm:gap-10 sm:py-10">
        <div className="text-center">
          <AnimatePresence mode="wait">
            <motion.h1
              key={title}
              initial={{ y: -16, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="max-w-full truncate px-2 text-3xl font-black italic tracking-tight text-white [text-shadow:0_3px_0_#d6338f,0_0_24px_rgba(255,255,255,0.45)] sm:text-5xl"
            >
              {title}
            </motion.h1>
          </AnimatePresence>
          <p className="mt-2 text-xs text-white/85 sm:text-sm">
            Two GitHub profiles, head to head, scored on the same levels DevQuest uses everywhere else.
          </p>
        </div>

        <div className="relative grid w-full grid-cols-[1fr_6rem_1fr] items-center sm:grid-cols-[1fr_10rem_1fr]">
          <Lightning amp={loading ? 2 : settled ? 0.8 : 1.3} />
          <Fighter side="a" login={left} state={stateOf("a")} />
          <motion.div
            className="z-10 flex justify-center"
            animate={loading ? { scale: [1, 1.15, 1] } : { scale: 1 }}
            transition={loading ? { duration: 0.6, repeat: Infinity } : { duration: 0.2 }}
          >
            <motion.span
              initial={{ scale: 3, opacity: 0, rotate: -15 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 12, delay: 0.5 }}
              className="select-none bg-gradient-to-b from-[#ffc2ec] via-[#ff5fc1] to-[#d6339f] bg-clip-text pr-2 text-6xl font-black italic text-transparent [filter:drop-shadow(2px_0_0_#fff)_drop-shadow(-2px_0_0_#fff)_drop-shadow(0_2px_0_#fff)_drop-shadow(0_-2px_0_#fff)_drop-shadow(0_6px_10px_rgba(0,0,0,0.3))] sm:text-8xl"
            >
              VS
            </motion.span>
          </motion.div>
          <Fighter side="b" login={right} state={stateOf("b")} />
        </div>

        <div className="grid w-full grid-cols-[1fr_6rem_1fr] items-start gap-1 sm:grid-cols-[1fr_10rem_1fr]">
          <div className="flex min-w-0 justify-center">
            <Nameplate login={left} profile={settled?.a} state={stateOf("a")} loading={loading} />
          </div>
          <div className="flex justify-center">
            {settled && (
              <motion.span
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-full bg-black/30 px-3 py-1 text-sm font-black tabular-nums text-white sm:text-lg"
              >
                {settled.wins.a} : {settled.wins.b}
              </motion.span>
            )}
          </div>
          <div className="flex min-w-0 justify-center">
            <Nameplate login={right} profile={settled?.b} state={stateOf("b")} loading={loading} />
          </div>
        </div>
      </div>
    </section>
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

function CompareView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const committedA = searchParams.get("a")?.trim() || undefined
  const committedB = searchParams.get("b")?.trim() || undefined

  const [a, setA] = useState(committedA ?? "")
  const [b, setB] = useState(committedB ?? "")
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

  // Drives off the URL so a comparison can be linked and shared, and so
  // clicking the example link (a client-side nav, not a remount) fills
  // the inputs too.
  useEffect(() => {
    if (committedA && committedB) {
      setA(committedA)
      setB(committedB)
      runCompare(committedA, committedB)
    }
  }, [committedA, committedB, runCompare])

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

  const settled = loading ? null : result

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <VersusArena left={committedA} right={committedB} loading={loading} error={error} result={result} />

      <form onSubmit={submit} className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={a}
          onChange={(event) => setA(event.target.value)}
          placeholder="First username"
          aria-label="First GitHub username"
          autoComplete="off"
        />

        <Button type="button" variant="ghost" size="icon" onClick={swap} aria-label="Swap usernames" className="self-center">
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

      {settled && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardContent className="p-4 sm:p-6">
              {settled.metrics.map((metric) => (
                <MetricRow key={metric.category} metric={metric} />
              ))}
            </CardContent>
          </Card>
        </motion.div>
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
