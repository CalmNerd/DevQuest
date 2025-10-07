export interface GSoCOrganization {
  name: string;
  description: string;
  url: string;
  image_url: string;
  image_background_color: string;
  category: string;
  projects_url: string;
  ideas_url: string;
  guide_url: string;
  topics: string[];
  technologies: string[];
  irc_channel: string;
  contact_email: string;
  mailing_list: string;
  twitter_url: string;
  blog_url: string;
  facebook_url: string;
  num_projects: number;
  projects: GSoCProject[];
}


export interface GSoCProject {
  title: string;
  short_description: string;
  description: string;
  student_name: string;
  code_url: string | null;
  proposal_id: string;
  project_url: string;
}

export interface GSoCYearData {
  year: number;
  organizations: GSoCOrganization[];
  totalOrganizations: number;
  totalProjects: number;
}

export interface GSoCOrganizationSummary {
  name: string;
  description: string;
  image_url: string;
  image_background_color: string;
  category: string;
  num_projects: number;
  topics: string[];
  technologies: string[];
  years: number[];
}

export interface GSoCOrganizationDetails extends GSoCOrganization {
  years: number[];
  totalProjectsAcrossYears: number;
  projectsByYear: Record<number, GSoCProject[]>;
}

export interface GSoCChartData {
  year: number;
  projects: number;
  organizations: number;
}

export interface GSoCListResponse {
  organizations: GSoCOrganizationSummary[];
  totalOrganizations: number;
  years: number[];
}

export interface GSoCOrganizationResponse {
  organization: GSoCOrganizationDetails;
  chartData: GSoCChartData[];
}

export interface GSoCYearResponse {
  year: GSoCYearData;
}
