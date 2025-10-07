import { GSoCDataService } from "@/services/external/gsoc-data.service";
import { GSoCOverviewClient } from "./GSoCOverviewClient";

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

  return <GSoCOverviewClient stats={stats} chartData={chartData} />;
}