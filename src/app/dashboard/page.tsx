import AnalyticsView from "@/components/dashboard/analyticsView";
import { SectionCards } from "@/components/dashboard/cardsHome";
import { ActivityTable } from "@/components/dashboard/data-table/activities";
import { BreadcrumbRoutas } from "@/components/ulils/breadcrumbRoutas";


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
