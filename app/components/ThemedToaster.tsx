"use client";

import { Toaster } from "sonner";
import { useTheme } from "./ThemeProvider";

export default function ThemedToaster() {
  const { theme } = useTheme();

  return (
    <Toaster
      theme={theme}
      position="bottom-center"
      duration={3500}
      toastOptions={{
        style: {
          background: "var(--color-surface-raised)",
          color: "var(--color-content)",
          border: "1px solid var(--color-edge-strong)",
          borderRadius: "6px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
          fontSize: "14px",
          fontWeight: 500,
        },
      }}
    />
  );
}
