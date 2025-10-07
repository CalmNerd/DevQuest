"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge, Button } from "@/components/ui"
import type { GSoCOrganizationSummary } from "@/types/gsoc.types"

export default function GSoCOrganizationsPreview() {
  const [orgs, setOrgs] = useState<GSoCOrganizationSummary[]>([])
  const [latestYear, setLatestYear] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/gsoc/organizations?limit=6`)
        if (!res.ok) throw new Error("Failed to fetch GSoC orgs")
        const data = await res.json()
        setOrgs(data.organizations || [])
        setLatestYear(typeof data.latestYear === "number" ? data.latestYear : null)
      } catch (e) {
        setError("Failed to load GSoC organizations")
      } finally {
        setLoading(false)
      }
    }
    fetchOrgs()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">GSoC Organizations</h3>
          </div>
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || orgs.length === 0) return null

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">GSoC Organizations{latestYear ? ` • ${latestYear}` : ""}</CardTitle>
        <Link href="/gsoc">
          <Button variant="outline" size="sm">View all</Button>
        </Link>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orgs.map((org, idx) => (
            <motion.div
              key={org.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link href={`/gsoc/organizations/${encodeURIComponent(org.name)}`} className="block">
                <div className="group rounded-lg border bg-card hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 p-4">
                    <div className="relative h-10 w-10 shrink-0 rounded-md overflow-hidden" style={{ backgroundColor: org.image_background_color || "#f3f4f6" }}>
                      {!!org.image_url && (
                        <Image src={org.image_url} alt={org.name} fill className="object-contain" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{org.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">{org.category || "Org"}</Badge>
                        <span className="text-xs text-muted-foreground">{latestYear ?? org.years[0]}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


