import React, { useEffect } from "react";
import SearchDasboardh from "../searchCommand";
import { NavUser } from "./nav-user";
import { Bells } from "./bells";
import { Mode } from "./mode";
import { SidebarToggleButton } from "../SidebarToggleButton";
import LocaleSwitcher from "../locale-switcher";
import { GreetingMessage } from "../greetingMessage";

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
    <div className="flex w-full flex-wrap px-5.5 my-6 items-center justify-between gap-4">
      <div className="flex items-center gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-full  size-12">
          <SidebarToggleButton
            collapsed={collapsed}
            isDarkMode={isDarkMode}
            isMobile={isMobile}
            onToggleSidebar={handleToggle}
            onOpenSheet={onOpenSheet}
          />
        </div>
        <GreetingMessage />
      </div>
      <div className="flex items-center gap-4">
        <SearchDasboardh />
        <LocaleSwitcher showLabel />
        <Mode />
        <Bells />
    
      </div>
    </div>
  );
}

export default Header;