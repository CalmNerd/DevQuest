"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ExternalLink, Mail, MessageCircle, Calendar, Code, Globe, Github, Twitter, Facebook, BookOpen } from "lucide-react";
import { GSoCOrganizationChart } from "@/components/gsoc/GSoCOrganizationChart";
import type { GSoCOrganizationDetails, GSoCChartData } from "@/types";

interface Props {
  organization: GSoCOrganizationDetails;
  chartData: GSoCChartData[];
}

export function OrganizationDetailClient({ organization, chartData }: Props) {
  const sortedYears = useMemo(() => [...organization.years].sort((a, b) => b - a), [organization.years]);
  const [selectedYear, setSelectedYear] = useState<number | null>(sortedYears[0] ?? null);
  const currentYearProjects = selectedYear ? organization.projectsByYear[selectedYear] || [] : [];

  return (
    <div className="space-y-8">
      <Link href="/gsoc">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Organizations
        </Button>
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card>
          <CardHeader>
            <div className="flex items-start gap-6">
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-xl border-2 flex items-center justify-center overflow-hidden" style={{ borderColor: organization.image_background_color }}>
                  {organization.image_url && organization.image_url.startsWith('https://') ? (
                    <Image
                      src={organization.image_url}
                      alt={organization.name}
                      width={80}
                      height={80}
                      className="rounded-xl object-contain"
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
                  <div className="fallback w-full h-full flex items-center justify-center text-white font-bold text-2xl" style={{ backgroundColor: organization.image_background_color, display: organization.image_url && organization.image_url.startsWith('https://') ? 'none' : 'flex' }}>
                    {organization.name.charAt(0)}
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{organization.name}</CardTitle>
                {organization.category && (
                  <Badge variant="secondary" className="mb-4">
                    {organization.category}
                  </Badge>
                )}
                <p className="text-muted-foreground leading-relaxed">{organization.description}</p>
                <div className="flex items-center gap-6 mt-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{organization.years.length} Years</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{organization.totalProjectsAcrossYears} Projects</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <Card>
          <CardHeader>
            <CardTitle>Links & Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {organization.url && (
                <Button variant="outline" asChild className="justify-start">
                  <a href={organization.url} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4 mr-2" />
                    Website
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
              )}
              {organization.blog_url && (
                <Button variant="outline" asChild className="justify-start">
                  <a href={organization.blog_url} target="_blank" rel="noopener noreferrer">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Blog
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
              )}
              {organization.twitter_url && (
                <Button variant="outline" asChild className="justify-start">
                  <a href={organization.twitter_url} target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-4 w-4 mr-2" />
                    Twitter
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
              )}
              {organization.facebook_url && (
                <Button variant="outline" asChild className="justify-start">
                  <a href={organization.facebook_url} target="_blank" rel="noopener noreferrer">
                    <Facebook className="h-4 w-4 mr-2" />
                    Facebook
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
              )}
              {organization.contact_email && (
                <Button variant="outline" asChild className="justify-start">
                  <a href={`mailto:${organization.contact_email}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </a>
                </Button>
              )}
              {organization.irc_channel && (
                <Button variant="outline" asChild className="justify-start">
                  <a href={`irc://${organization.irc_channel}`}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    IRC: {organization.irc_channel}
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {(organization.topics.length > 0 || organization.technologies.length > 0) && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle>Topics & Technologies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {organization.topics.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {organization.topics.map((topic) => (
                        <Badge key={topic} variant="secondary">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {organization.technologies.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Technologies</h4>
                    <div className="flex flex-wrap gap-2">
                      {organization.technologies.map((tech) => (
                        <Badge key={tech} variant="outline">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="projects">Projects by Year</TabsTrigger>
            <TabsTrigger value="chart">Statistics</TabsTrigger>
          </TabsList>
          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Year</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {sortedYears.map((year) => (
                    <Button key={year} variant={selectedYear === year ? "default" : "outline"} size="sm" onClick={() => setSelectedYear(year)}>
                      {year}
                      <Badge variant="secondary" className="ml-2">
                        {organization.projectsByYear[year]?.length || 0}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
            {selectedYear && (
              <Card>
                <CardHeader>
                  <CardTitle>Projects in {selectedYear} ({currentYearProjects.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentYearProjects.length > 0 ? (
                    <div className="space-y-4">
                      {currentYearProjects.map((project, index) => (
                        <motion.div key={project.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
                          <Card className="border-l-4 border-l-primary">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div>
                                  <h4 className="font-semibold text-lg">{project.title}</h4>
                                  {project.student_name && (
                                    <p className="text-sm text-muted-foreground">by {project.student_name}</p>
                                  )}
                                </div>
                                {project.short_description && (<p className="text-sm">{project.short_description}</p>)}
                                {project.description && (<p className="text-sm text-muted-foreground">{project.description}</p>)}
                                <div className="flex items-center gap-4">
                                  {project.code_url && (
                                    <Button variant="outline" size="sm" asChild>
                                      <a href={project.code_url} target="_blank" rel="noopener noreferrer">
                                        <Github className="h-4 w-4 mr-2" />
                                        Code
                                        <ExternalLink className="h-3 w-3 ml-2" />
                                      </a>
                                    </Button>
                                  )}
                                  {project.project_url && (
                                    <Button variant="outline" size="sm" asChild>
                                      <a href={project.project_url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Project
                                      </a>
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No projects found for {selectedYear}.</p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="chart" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Statistics by Year</CardTitle>
              </CardHeader>
              <CardContent>
                <GSoCOrganizationChart data={chartData} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}


