"use client";

import * as React from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "next-themes";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ModeToggle(props: { className?: string }) {
  const { setTheme, theme } = useTheme(); // light, dark, system

  return (
    <Tabs
      defaultValue={theme}
      className={props.className}
      onValueChange={(v) => setTheme(v)}
    >
      <TabsList>
        <TabsTrigger value="light" className="p-1">
          <Sun className="size-4" />
        </TabsTrigger>
        <TabsTrigger value="system" className="p-1">
          <Laptop className="size-4" />
        </TabsTrigger>
        <TabsTrigger value="dark" className="p-1">
          <Moon className="size-4" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
