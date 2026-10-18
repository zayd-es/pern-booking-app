// by claude: sun / moon button for dark mode
import { Moon, Sun } from "lucide-react";
import { toggleDarkMode, useDarkMode } from "@/shared/lib/theme";

const ThemeToggle = ({ className = "" }) => {
  const isDark = useDarkMode();
  return (
    <button
      onClick={toggleDarkMode}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 ${className}`}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
};

export default ThemeToggle;
