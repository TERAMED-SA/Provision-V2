import AnalyticsView from "@/components/dashboard/analyticsView";
import { SectionCards } from "@/components/dashboard/cardsHome";
import { ActivityTable } from "@/components/dashboard/data-table/activities";
import { GreetingMessage } from "@/components/dashboard/greetingMessage";

export default function Dashboard() {
  return (
    <main className="flex flex-col gap-6">
      <GreetingMessage />
      <SectionCards />
      <AnalyticsView/>
      <ActivityTable />  
    </main>
  );
}
