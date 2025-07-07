import SearchDasboardh from "../searchCommand";
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
    <div className="flex w-full flex-wrap px-6 py-3 mb-6 items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-6">
        <div className="bg-white dark:bg-gray-800 dark:text-white rounded-full  size-12">
          <SidebarToggleButton
            collapsed={collapsed}
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