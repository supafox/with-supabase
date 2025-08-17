"use client"

import * as React from "react"
import { IconMoon, IconSun } from "@tabler/icons-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, theme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className={className}
    >
      <IconSun className="h-[1.5rem] w-[1.3rem] dark:hidden" />
      <IconMoon className="hidden h-5 w-5 dark:block" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
