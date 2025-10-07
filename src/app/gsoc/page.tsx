import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Code, Users } from "lucide-react";
import { GSoCDataService } from "@/services/external/gsoc-data.service";
import type { GSoCOrganizationSummary } from "@/types";
import { OrganizationsBrowser } from "@/components/gsoc/OrganizationsBrowser";

interface GSoCStats {
  totalYears: number;
  totalProjects: number;
  totalOrganizations: number;
  uniqueOrganizations: number;
}

export default async function GSoCPage() {
  const organizations: GSoCOrganizationSummary[] = await GSoCDataService.getAllOrganizationsSummary();
  const years = await GSoCDataService.getAvailableYears();

  // Derive stats
  const totalYears = years.length;
  const totalOrganizations = organizations.reduce((sum, org) => sum + org.years.length, 0);
  const totalProjects = organizations.reduce((sum, org) => sum + org.num_projects, 0);
  const uniqueOrganizations = organizations.length;

  const stats: GSoCStats = {
    totalYears,
    totalProjects,
    totalOrganizations,
    uniqueOrganizations,
  };

  // Derive filter facets
  const categories = Array.from(new Set(organizations.map(o => o.category))).filter(Boolean);
  const technologies = Array.from(new Set(organizations.flatMap(o => o.technologies))).filter(Boolean).sort();
  const topics = Array.from(new Set(organizations.flatMap(o => o.topics))).filter(Boolean).sort();

  return (
    <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalYears}</p>
                  <p className="text-sm text-muted-foreground">Years</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.uniqueOrganizations}</p>
                  <p className="text-sm text-muted-foreground">Organizations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Code className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalProjects}</p>
                  <p className="text-sm text-muted-foreground">Projects</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalOrganizations}</p>
                  <p className="text-sm text-muted-foreground">Total Participations</p>
                </div>
              </div>
            </CardContent>
          </Card>
            </div>
            
      <OrganizationsBrowser
        organizations={organizations}
        categories={categories}
        years={years}
        technologies={technologies}
        topics={topics}
      />
    </div>
  );
}
