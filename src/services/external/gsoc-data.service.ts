import { readFile, readdir } from "fs/promises";
import { join } from "path";
import type {
  GSoCOrganization,
  GSoCYearData,
  GSoCOrganizationSummary,
  GSoCOrganizationDetails,
  GSoCChartData
} from "@/types";

//GSoC Data Service for reading and processing JSON data files
export class GSoCDataService {
  private static readonly DATA_DIR = join(process.cwd(), "src", "lib", "data", "gsoc");

  // Get all available years from data files
  static async getAvailableYears(): Promise<number[]> {
    try {
      const files = await readdir(this.DATA_DIR);
      const years = files
        .filter(file => file.startsWith('gsoc_') && file.endsWith('.json'))
        .map(file => parseInt(file.replace('gsoc_', '').replace('.json', '')))
        .filter(year => !isNaN(year))
        .sort((a, b) => b - a); // Sort descending (newest first)

      return years;
    } catch (error) {
      console.error('Error reading GSoC data directory:', error);
      return [];
    }
  }

  // Load data for a specific year
  static async loadYearData(year: number): Promise<GSoCYearData | null> {
    try {
      const filePath = join(this.DATA_DIR, `gsoc_${year}.json`);
      const fileContent = await readFile(filePath, 'utf-8');
      const parsed = JSON.parse(fileContent);
      const organizations: GSoCOrganization[] = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.organizations)
          ? parsed.organizations
          : [];
      const fileYear: number | undefined = Array.isArray(parsed) ? undefined : parsed?.year;

      const totalProjects = organizations.reduce((sum, org) => sum + (org?.num_projects || 0), 0);

      return {
        year: typeof fileYear === 'number' ? fileYear : year,
        organizations,
        totalOrganizations: organizations.length,
        totalProjects,
      };
    } catch (error) {
      console.error(`Error loading data for year ${year}:`, error);
      return null;
    }
  }

  // Load all available years data
  static async loadAllYearsData(): Promise<GSoCYearData[]> {
    const years = await this.getAvailableYears();
    const yearDataPromises = years.map(year => this.loadYearData(year));
    const yearDataResults = await Promise.all(yearDataPromises);

    return yearDataResults.filter((data): data is GSoCYearData => data !== null);
  }

  // Get organization summary by name across all years
  static async getOrganizationSummary(orgName: string): Promise<GSoCOrganizationSummary | null> {
    try {
      const allYearsData = await this.loadAllYearsData();
      const orgData: { org: GSoCOrganization; year: number }[] = [];

      // Find organization across all years
      for (const yearData of allYearsData) {
        const org = yearData.organizations.find(o => o.name === orgName);
        if (org) {
          orgData.push({ org, year: yearData.year });
        }
      }

      if (orgData.length === 0) {
        return null;
      }

      // Use the most recent organization data as base
      const latestOrg = orgData[0].org;
      const years = orgData.map(d => d.year).sort((a, b) => b - a);

      // Aggregate topics and technologies across all years
      const allTopics = Array.from(new Set(orgData.flatMap(d => d.org.topics)));
      const allTechnologies = Array.from(new Set(orgData.flatMap(d => d.org.technologies)));

      return {
        name: latestOrg.name,
        description: latestOrg.description,
        image_url: latestOrg.image_url,
        image_background_color: latestOrg.image_background_color,
        category: latestOrg.category,
        num_projects: orgData.reduce((sum, d) => sum + d.org.num_projects, 0),
        topics: allTopics,
        technologies: allTechnologies,
        years,
      };
    } catch (error) {
      console.error(`Error getting organization summary for ${orgName}:`, error);
      return null;
    }
  }

  // Get detailed organization data with all years and projects
  static async getOrganizationDetails(orgName: string): Promise<GSoCOrganizationDetails | null> {
    try {
      const allYearsData = await this.loadAllYearsData();
      const orgData: { org: GSoCOrganization; year: number }[] = [];

      // Find organization across all years
      for (const yearData of allYearsData) {
        const org = yearData.organizations.find(o => o.name === orgName);
        if (org) {
          orgData.push({ org, year: yearData.year });
        }
      }

      if (orgData.length === 0) {
        return null;
      }

      // Use the most recent organization data as base
      const latestOrg = orgData[0].org;
      const years = orgData.map(d => d.year).sort((a, b) => b - a);

      // Build projects by year
      const projectsByYear: Record<number, GSoCOrganization['projects']> = {};
      for (const { org, year } of orgData) {
        projectsByYear[year] = org.projects;
      }

      const totalProjectsAcrossYears = orgData.reduce((sum, d) => sum + d.org.num_projects, 0);

      // Aggregate topics and technologies across all years
      const allTopics = Array.from(new Set(orgData.flatMap(d => d.org.topics)));
      const allTechnologies = Array.from(new Set(orgData.flatMap(d => d.org.technologies)));

      return {
        ...latestOrg,
        topics: allTopics,
        technologies: allTechnologies,
        years,
        totalProjectsAcrossYears,
        projectsByYear,
      };
    } catch (error) {
      console.error(`Error getting organization details for ${orgName}:`, error);
      return null;
    }
  }

  // Get all organizations summary for listing
  static async getAllOrganizationsSummary(): Promise<GSoCOrganizationSummary[]> {
    try {
      const allYearsData = await this.loadAllYearsData();
      const orgMap = new Map<string, GSoCOrganizationSummary>();

      // Process all years and aggregate organization data
      for (const yearData of allYearsData) {
        for (const org of yearData.organizations) {
          const existing = orgMap.get(org.name);

          if (existing) {
            // Update existing organization
            existing.num_projects += org.num_projects;
            existing.years.push(yearData.year);
            existing.years.sort((a, b) => b - a);

            // Merge topics and technologies (remove duplicates)
            existing.topics = Array.from(new Set([...existing.topics, ...org.topics]));
            existing.technologies = Array.from(new Set([...existing.technologies, ...org.technologies]));
          } else {
            // Add new organization
            orgMap.set(org.name, {
              name: org.name,
              description: org.description,
              image_url: org.image_url,
              image_background_color: org.image_background_color,
              category: org.category,
              num_projects: org.num_projects,
              topics: [...org.topics],
              technologies: [...org.technologies],
              years: [yearData.year],
            });
          }
        }
      }

      return Array.from(orgMap.values()).sort((a, b) => b.num_projects - a.num_projects);
    } catch (error) {
      console.error('Error getting all organizations summary:', error);
      return [];
    }
  }

  // Get chart data for organization
  static async getOrganizationChartData(orgName: string): Promise<GSoCChartData[]> {
    try {
      const allYearsData = await this.loadAllYearsData();
      const chartData: GSoCChartData[] = [];

      for (const yearData of allYearsData) {
        const org = yearData.organizations.find(o => o.name === orgName);
        if (org) {
          chartData.push({
            year: yearData.year,
            projects: org.num_projects,
            organizations: 1, // This org participated this year
          });
        }
      }

      return chartData.sort((a, b) => a.year - b.year);
    } catch (error) {
      console.error(`Error getting chart data for ${orgName}:`, error);
      return [];
    }
  }

  // Get chart data for overall GSoC statistics
  static async getOverallChartData(): Promise<GSoCChartData[]> {
    try {
      const allYearsData = await this.loadAllYearsData();

      return allYearsData.map(yearData => ({
        year: yearData.year,
        projects: yearData.totalProjects,
        organizations: yearData.totalOrganizations,
      })).sort((a, b) => a.year - b.year);
    } catch (error) {
      console.error('Error getting overall chart data:', error);
      return [];
    }
  }
}
