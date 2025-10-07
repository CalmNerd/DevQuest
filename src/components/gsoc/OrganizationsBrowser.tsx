"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import type { GSoCOrganizationSummary } from "@/types";

interface OrganizationsBrowserProps {
  organizations: GSoCOrganizationSummary[];
  categories: string[];
  years: number[];
  technologies: string[];
  topics: string[];
}

export function OrganizationsBrowser({ organizations, categories, years, technologies, topics }: OrganizationsBrowserProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedTechnology, setSelectedTechnology] = useState<string>("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");

  const filteredOrganizations = useMemo(() => {
    let result = organizations;

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      result = result.filter(org =>
        org.name.toLowerCase().includes(s) ||
        org.description.toLowerCase().includes(s) ||
        org.topics.some(t => t.toLowerCase().includes(s)) ||
        org.technologies.some(t => t.toLowerCase().includes(s))
      );
    }

    if (selectedCategory !== "all") {
      result = result.filter(org => org.category === selectedCategory);
    }

    if (selectedYear !== "all") {
      const y = parseInt(selectedYear, 10);
      result = result.filter(org => org.years.includes(y));
    }

    if (selectedTechnology !== "all") {
      result = result.filter(org => org.technologies.includes(selectedTechnology));
    }

    if (selectedTopic !== "all") {
      result = result.filter(org => org.topics.includes(selectedTopic));
    }

    return result;
  }, [organizations, searchTerm, selectedCategory, selectedYear, selectedTechnology, selectedTopic]);

  const getOrganizationSlug = (name: string) => encodeURIComponent(name);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search organizations, topics, or technologies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedTechnology} onValueChange={setSelectedTechnology}>
                <SelectTrigger>
                  <SelectValue placeholder="Technology" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="all">All Technologies</SelectItem>
                  {technologies.map((tech) => (
                    <SelectItem key={tech} value={tech}>
                      {tech}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger>
                  <SelectValue placeholder="Topic" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="all">All Topics</SelectItem>
                  {topics.map((topic) => (
                    <SelectItem key={topic} value={topic}>
                      {topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(selectedCategory !== "all" || selectedYear !== "all" || selectedTechnology !== "all" || selectedTopic !== "all" || searchTerm) && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                    setSelectedYear("all");
                    setSelectedTechnology("all");
                    setSelectedTopic("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Organizations ({filteredOrganizations.length})
          </h2>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${searchTerm}-${selectedCategory}-${selectedYear}-${selectedTechnology}-${selectedTopic}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredOrganizations.map((org, index) => (
              <motion.div
                key={org.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link href={`/gsoc/organizations/${getOrganizationSlug(org.name)}`}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:border-primary/50 group cursor-pointer">
                    <CardHeader className="pb-4">
                      <div className="flex items-start gap-4">
                        <div className="relative flex-shrink-0">
                          <div
                            className="w-16 h-16 rounded-lg border-2 flex items-center justify-center overflow-hidden"
                            style={{ borderColor: org.image_background_color }}
                          >
                            {org.image_url && org.image_url.startsWith('https://') ? (
                              <Image
                                src={org.image_url}
                                alt={org.name}
                                width={48}
                                height={48}
                                className="rounded-lg object-contain"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.parentElement?.querySelector('.fallback');
                                  if (fallback) {
                                    (fallback as HTMLElement).style.display = 'flex';
                                  }
                                }}
                              />
                            ) : null}
                            <div
                              className="fallback w-full h-full flex items-center justify-center text-white font-bold text-lg"
                              style={{
                                backgroundColor: org.image_background_color,
                                display: org.image_url && org.image_url.startsWith('https://') ? 'none' : 'flex'
                              }}
                            >
                              {org.name.charAt(0)}
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                            {org.name}
                          </CardTitle>
                          {org.category && (
                            <Badge variant="secondary" className="mt-1">
                              {org.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {org.description}
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Projects</span>
                          <span className="font-medium">{org.num_projects}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Years</span>
                          <span className="font-medium">{org.years.length}</span>
                        </div>
                        {org.topics.length > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Topics</p>
                            <div className="flex flex-wrap gap-1">
                              {org.topics.slice(0, 3).map((topic) => (
                                <Badge key={topic} variant="outline" className="text-xs">
                                  {topic}
                                </Badge>
                              ))}
                              {org.topics.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{org.topics.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredOrganizations.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No organizations found matching your criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


