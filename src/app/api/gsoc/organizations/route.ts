import { NextResponse } from "next/server";
import { GSoCDataService } from "@/services/external/gsoc-data.service";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? Math.max(1, Math.min(12, Number(limitParam))) : 3;

    const [organizations, years] = await Promise.all([
      GSoCDataService.getAllOrganizationsSummary(),
      GSoCDataService.getAvailableYears(),
    ]);
    const latestYear = years[0];

    const latestYearOrgs = latestYear
      ? organizations.filter((o) => o.years.includes(latestYear))
      : organizations;

    const sliced = latestYearOrgs.slice(0, limit);

    return NextResponse.json({ organizations: sliced, total: latestYearOrgs.length, latestYear });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load GSoC organizations" }, { status: 500 });
  }
}
