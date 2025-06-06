import { AlignLeft, Menu } from "lucide-react";
import { cn } from "@/src/lib/utils";

export interface SidebarToggleButtonProps {
  collapsed: boolean;
  isDarkMode: boolean;
  isMobile: boolean;
  onToggleSidebar: () => void;
  onOpenSheet?: () => void;
  className?: string;
}

export function SidebarToggleButton({
  collapsed,
  isDarkMode,
  isMobile,
  onToggleSidebar,
  onOpenSheet,
  className,
}: SidebarToggleButtonProps) {
  const handleClick = () => {
    if (isMobile && onOpenSheet) {
      onOpenSheet();
    } else {
      onToggleSidebar();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "size-16 flex items-center justify-center cursor-pointer",
        isDarkMode ? "text-white" : "text-gray-700",
        className
      )}
    >
      {collapsed ? (
        <AlignLeft size={26} className={isDarkMode ? "text-white" : "text-gray-700"} />
      ) : (
        <Menu size={26} className={isDarkMode ? "text-white" : "text-gray-700"} />
      )}
    </button>
  );
}