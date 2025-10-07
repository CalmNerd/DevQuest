import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Calendar, Users, Code, TrendingUp, Globe, Award } from "lucide-react";
import { GSoCOverallChart } from "@/components/gsoc/GSoCOverallChart";
import { GSoCDataService } from "@/services/external/gsoc-data.service";
import type { GSoCChartData } from "@/types";

interface GSoCStats {
  totalYears: number;
  totalProjects: number;
  totalOrganizations: number;
  uniqueOrganizations: number;
  avgProjectsPerYear: number;
  avgOrganizationsPerYear: number;
  yearWithMostProjects: {
    year: number;
    totalProjects: number;
    totalOrganizations: number;
  };
  yearWithMostOrgs: {
    year: number;
    totalProjects: number;
    totalOrganizations: number;
  };
}

export default async function GSoCOverviewPage() {
  const chartData = await GSoCDataService.getOverallChartData();
  const allYearsData = await GSoCDataService.loadAllYearsData();
  const totalOrganizations = allYearsData.reduce((sum, y) => sum + y.totalOrganizations, 0);
  const totalProjects = allYearsData.reduce((sum, y) => sum + y.totalProjects, 0);
  const totalYears = allYearsData.length;
  const avgProjectsPerYear = totalYears > 0 ? Math.round(totalProjects / totalYears) : 0;
  const avgOrganizationsPerYear = totalYears > 0 ? Math.round(totalOrganizations / totalYears) : 0;
  const yearWithMostProjects = allYearsData.reduce((max, y) => y.totalProjects > max.totalProjects ? y : max);
  const yearWithMostOrgs = allYearsData.reduce((max, y) => y.totalOrganizations > max.totalOrganizations ? y : max);

  const stats: GSoCStats = {
    totalYears,
    totalProjects,
    totalOrganizations,
    uniqueOrganizations: (await GSoCDataService.getAllOrganizationsSummary()).length,
    avgProjectsPerYear,
    avgOrganizationsPerYear,
    yearWithMostProjects: { year: yearWithMostProjects.year, totalProjects: yearWithMostProjects.totalProjects, totalOrganizations: yearWithMostProjects.totalOrganizations },
    yearWithMostOrgs: { year: yearWithMostOrgs.year, totalProjects: yearWithMostOrgs.totalProjects, totalOrganizations: yearWithMostOrgs.totalOrganizations },
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Globe className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">GSoC Overview</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A comprehensive look at Google Summer of Code's impact on open source development
        </p>
      </motion.div>

      {/* Key Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Card className="border-primary/20 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <p className="text-3xl font-bold">{stats.totalYears}</p>
                <p className="text-sm text-muted-foreground">Years</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-primary/20 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-3xl font-bold">{stats.uniqueOrganizations}</p>
                <p className="text-sm text-muted-foreground">Organizations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-primary/20 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Code className="h-8 w-8 text-primary" />
              <div>
                <p className="text-3xl font-bold">{stats.totalProjects}</p>
                <p className="text-sm text-muted-foreground">Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-primary/20 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <p className="text-3xl font-bold">{stats.avgProjectsPerYear}</p>
                <p className="text-sm text-muted-foreground">Avg Projects/Year</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <GSoCOverallChart data={chartData} />
      </motion.div>

      {/* Highlights Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Most Productive Year
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{stats.yearWithMostProjects.year}</p>
                <p className="text-sm text-muted-foreground">Year with Most Projects</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <p className="text-2xl font-bold">{stats.yearWithMostProjects.totalProjects}</p>
                  <p className="text-xs text-muted-foreground">Projects</p>
                </div>
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <p className="text-2xl font-bold">{stats.yearWithMostProjects.totalOrganizations}</p>
                  <p className="text-xs text-muted-foreground">Organizations</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Most Participated Year
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{stats.yearWithMostOrgs.year}</p>
                <p className="text-sm text-muted-foreground">Year with Most Organizations</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <p className="text-2xl font-bold">{stats.yearWithMostOrgs.totalOrganizations}</p>
                  <p className="text-xs text-muted-foreground">Organizations</p>
                </div>
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <p className="text-2xl font-bold">{stats.yearWithMostOrgs.totalProjects}</p>
                  <p className="text-xs text-muted-foreground">Projects</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Growth Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Growth Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl">
                <TrendingUp className="h-8 w-8 text-primary mx-auto mb-3" />
                <p className="text-2xl font-bold">{stats.avgOrganizationsPerYear}</p>
                <p className="text-sm text-muted-foreground">Avg Organizations/Year</p>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl">
                <Code className="h-8 w-8 text-secondary-foreground mx-auto mb-3" />
                <p className="text-2xl font-bold">{stats.avgProjectsPerYear}</p>
                <p className="text-sm text-muted-foreground">Avg Projects/Year</p>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl">
                <Globe className="h-8 w-8 text-primary mx-auto mb-3" />
                <p className="text-2xl font-bold">
                  {stats.totalProjects > 0 ? Math.round((stats.totalProjects / stats.totalOrganizations) * 10) / 10 : 0}
                </p>
                <p className="text-sm text-muted-foreground">Projects per Organization</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
