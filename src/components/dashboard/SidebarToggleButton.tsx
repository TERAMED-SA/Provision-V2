import { cn } from "@/lib/utils";
import { AlignLeft,  Menu } from "lucide-react";

export interface SidebarToggleButtonProps {
  collapsed: boolean;
  isMobile: boolean;
  onToggleSidebar: () => void;
  onOpenSheet?: () => void;
  className?: string;
}

export function SidebarToggleButton({
  collapsed,
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
        "size-12 flex items-center justify-center cursor-pointer p-2 rounded-full bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-600  transition-colors",
        className
      )}
    >
      {collapsed ? (
        <AlignLeft   size={26} className="text-gray-700 dark:text-white" />
      ) : (
        <Menu size={26} className="text-gray-700 dark:text-white" />
      )}
    </button>
  );
}