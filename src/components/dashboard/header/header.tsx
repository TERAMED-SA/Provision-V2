import React, { useEffect } from "react";
import SearchDasboardh from "../searchCommand";
import { NavUser } from "./nav-user";
import { Bells } from "./bells";
import { Mode } from "./mode";
import { SidebarToggleButton } from "../SidebarToggleButton";
import LocaleSwitcher from "../locale-switcher";

interface HeaderProps {
  collapsed: boolean;
  isDarkMode: boolean;
  toggleSidebar: () => void;
  isMobile: boolean;
  onOpenSheet?: () => void;
}

function Header({ 
  collapsed, 
  isDarkMode, 
  toggleSidebar, 
  isMobile,
  onOpenSheet 
}: HeaderProps) {
  
  const handleToggle = () => {
    if (isMobile && onOpenSheet) {
      onOpenSheet();
    } else {
      toggleSidebar();
    }
  };

  return (
    <div className="flex border-b bg-white dark:bg-gray-800 w-full flex-wrap p-1 items-center justify-between gap-4">
      <div>
        <SidebarToggleButton
          collapsed={collapsed}
          isDarkMode={isDarkMode}
          isMobile={isMobile}
          onToggleSidebar={handleToggle}
          onOpenSheet={onOpenSheet}
        />
      </div>
      <div className="flex items-center gap-4">
        <LocaleSwitcher />
        <SearchDasboardh />
        <Mode />
        <Bells />
        <NavUser />
      </div>
    </div>
  );
}

export default Header;