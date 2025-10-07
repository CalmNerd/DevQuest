import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { GSoCDataService } from "@/services/external/gsoc-data.service";
import { OrganizationDetailClient } from "@/components/gsoc";

export default async function OrganizationDetailPage({ params }: { params: { name: string } }) {
  const orgName = decodeURIComponent(params.name);
  const organization = await GSoCDataService.getOrganizationDetails(orgName);
  const chartData = await GSoCDataService.getOrganizationChartData(orgName);

  if (!organization) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Organization not found</h2>
        <p className="text-muted-foreground mb-6">The organization you're looking for doesn't exist.</p>
        <Link href="/gsoc">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Organizations
          </Button>
        </Link>
      </div>
    );
  }

  return <OrganizationDetailClient organization={organization} chartData={chartData} />;
}
