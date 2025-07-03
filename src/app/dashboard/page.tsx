import AnalyticsView from "@/components/dashboard/analyticsView";
import { ActivityTable } from "@/components/dashboard/data-table/activities";
import MetrictsCards from "@/components/dashboard/metrictsCards";

export default function Dashboard() {
  return (
    <main className="flex flex-col gap-6">
      <MetrictsCards/>
      <AnalyticsView/>
      <ActivityTable />  
    </main>
  );
}
