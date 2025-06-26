import AnalyticsView from "@/components/dashboard/analyticsView";
import { ActivityTable } from "@/components/dashboard/data-table/activities";

export default function Dashboard() {
  return (
    <main className="flex flex-col gap-6">
      <AnalyticsView/>
      <ActivityTable />  
    </main>
  );
}
