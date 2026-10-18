import { BrowserRouter } from "react-router-dom"; // by claude: global providers (moved out of main.jsx)
import { ClerkProvider } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import { useDarkMode } from "@/shared/lib/theme";
import ErrorBoundary from "@/shared/components/ui/ErrorBoundary";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key. Check your .env file!");
}

// Clerk popups (login, avatar menu) follow the site's dark mode
const Providers = ({ children }) => {
  const isDark = useDarkMode();
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      appearance={{ baseTheme: isDark ? dark : undefined }}
    >
      <BrowserRouter>
        <ErrorBoundary>{children}</ErrorBoundary>
      </BrowserRouter>
    </ClerkProvider>
  );
};

export default Providers;
