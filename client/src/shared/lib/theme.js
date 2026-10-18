// by claude: dark mode helpers. The "dark" class on <html> is the single source of truth
// (index.html sets it before React loads, so there is no white flash).
import { useSyncExternalStore } from "react";

const KEY = "theme";

const subscribe = (cb) => {
  const observer = new MutationObserver(cb);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
};

const getSnapshot = () => document.documentElement.classList.contains("dark");

export const useDarkMode = () => useSyncExternalStore(subscribe, getSnapshot, () => false);

export const toggleDarkMode = () => {
  const next = !document.documentElement.classList.contains("dark");
  document.documentElement.classList.toggle("dark", next);
  try {
    localStorage.setItem(KEY, next ? "dark" : "light");
  } catch {
    // private mode: the choice just isn't remembered
  }
};
