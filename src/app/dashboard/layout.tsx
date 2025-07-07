"use client";
import Header from "@/components/dashboard/header/header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useEffect, useState } from "react";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  return isMobile;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isMobile = useIsMobile();
  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  return (
    <div className="flex h-screen">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        isMobile={isMobile}
        isSheetOpen={isSheetOpen}
        setIsSheetOpen={setIsSheetOpen}
        className={isMobile ? "hidden" : ""}
      />
      <div className="flex flex-col flex-1 h-screen">   
        <div className="sticky top-0 z-50  ">
          <Header
            collapsed={sidebarCollapsed}
            isDarkMode={false}
            toggleSidebar={toggleSidebar}
            isMobile={isMobile}
            onOpenSheet={() => setIsSheetOpen(true)}
          />
        </div>
        <main className="flex-1 overflow-y-auto h-screen p-3 md:px-6 ">
          {children}
        </main>
      </div>
    </div>
  );
}