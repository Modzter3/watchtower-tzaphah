"use client";

import { useEffect } from "react";

export function HtmlThemeSync() {
  useEffect(() => {
    try {
      const t = localStorage.getItem("tzaphah-theme");
      document.documentElement.classList.toggle("dark", t !== "light");
    } catch {
      /* ignore */
    }
  }, []);
  return null;
}
