"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Toggle } from "@/components/ui/toggle";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="size-9" />;
  }

  const isDark = theme === "dark";

  return (
    <Toggle
      className="group size-9 rounded-full border-border/50 data-[state=on]:bg-transparent data-[state=on]:hover:bg-muted"
      onPressedChange={() => setTheme(isDark ? "light" : "dark")}
      pressed={isDark}
      size="sm"
      variant="outline"
      aria-label="Toggle theme"
    >
      <Moon aria-hidden="true" className="shrink-0 scale-0 opacity-0 transition-all group-data-[state=on]:scale-100 group-data-[state=on]:opacity-100 text-purple-400" size={16} strokeWidth={2}/>
      <Sun aria-hidden="true" className="absolute shrink-0 scale-100 opacity-100 transition-all group-data-[state=on]:scale-0 group-data-[state=on]:opacity-0 text-amber-500" size={16} strokeWidth={2}/>
    </Toggle>
  );
}
