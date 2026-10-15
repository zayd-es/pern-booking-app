import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { dark } from "@clerk/themes"; // by claude
import { useDarkMode } from "./lib/theme"; // by claude
import App from "./App.jsx";
import ErrorBoundary from "./components/common/ErrorBoundary.jsx"; // by claude
import "./index.css";

// by claude: main.jsx is the app entry point (no exports by design), fast refresh does not apply to it
/* eslint-disable react-refresh/only-export-components */
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key. Check your .env file!");
}

// by claude: Clerk popups (login, avatar menu) follow the site's dark mode
const Root = () => {
  const isDark = useDarkMode();
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      appearance={{ baseTheme: isDark ? dark : undefined }}
    >
      <BrowserRouter>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </BrowserRouter>
    </ClerkProvider>
  );
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
