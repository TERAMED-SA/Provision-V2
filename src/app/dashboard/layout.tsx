"use client";
import { getUser } from "@/src/features/services/auth/authApi";
import Header from "@/src/ui/components/dashboard/header/header";
import { Sidebar } from "@/src/ui/components/dashboard/sidebar";
import LoadingScreen from "@/src/ui/components/ui/loadingScreen";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const router = useRouter();
  const isMobile = useIsMobile();

  useEffect(() => {
    async function validateSession() {
      try {
        const user = await getUser();
      } catch (err) {
        console.error("Usuário não autenticado", err);
      } finally {
        setLoading(false);
      }
    }
    validateSession();
  }, [router]);

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  const handleSidebarToggle = () => {
    if (isMobile) {
      setIsSheetOpen(true);
    } else {
      toggleSidebar();
    }
  };

  if (loading) return <LoadingScreen message="Validando sessão do usuário..." />;

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
        <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 ">
          <Header
            collapsed={sidebarCollapsed}
            isDarkMode={false}
            toggleSidebar={toggleSidebar}
            isMobile={isMobile}
            onOpenSheet={() => setIsSheetOpen(true)}
          />
        </div>
        <main className="flex-1 overflow-y-auto bg-[#FAFAFB] p-3 md:px-6 md:py-4 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}