"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only show the theme toggle after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Render a placeholder with the same dimensions during SSR
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 sm:h-9 sm:w-9"
        aria-hidden="true"
        tabIndex={-1}
      >
        <span className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>
    );
  }

  // Create unique IDs for ARIA relationships
  const themeToggleId = "theme-toggle";
  const themeStatusId = "theme-status";
  
  return (
    <>
      <Button
        id={themeToggleId}
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="h-8 w-8 sm:h-9 sm:w-9"
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        aria-pressed={theme === "dark"}
        aria-describedby={themeStatusId}
        aria-controls="html-element" // Controls the HTML element's class
        title={`Currently in ${theme} mode. Click to switch to ${theme === "dark" ? "light" : "dark"} mode.`}
      >
        {theme === "dark" ? (
          <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-300" aria-hidden="true" />
        ) : (
          <Moon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
        )}
      </Button>
      
      {/* Hidden status for screen readers */}
      <span id={themeStatusId} className="sr-only">
        {`Currently in ${theme} mode`}
      </span>
    </>
  );
}
