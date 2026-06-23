"use client";

import { Toaster } from "sonner";
import { useTheme } from "./ThemeProvider";

export default function ThemedToaster() {
  const { theme } = useTheme();

  return (
    <Toaster
      theme={theme}
      position="top-right"
      toastOptions={{
        style: {
          background: "var(--color-surface)",
          color: "var(--color-content)",
          border: "1px solid var(--color-edge)",
          borderRadius: "6px",
          fontSize: "14px",
          fontWeight: 500,
        },
      }}
    />
  );
}
