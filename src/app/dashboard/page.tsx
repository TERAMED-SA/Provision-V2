import AnalyticsView from "@/src/ui/components/dashboard/analyticsView";
import { SectionCards } from "@/src/ui/components/dashboard/cardsHome";
import { ActivityTable } from "@/src/ui/components/dashboard/data-table/activities";
import { BreadcrumbRoutas } from "@/src/ui/components/ulils/breadcrumbRoutas";

export default function Dashboard() {
  return (
    <main className="flex flex-col gap-6">
      <BreadcrumbRoutas/>
      <SectionCards />
      <AnalyticsView/>
      <ActivityTable />  
    </main>
  );
}
