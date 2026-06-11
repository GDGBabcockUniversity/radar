import type { Metadata } from "next";
import { Google_Sans_Flex, Caveat, Merriweather } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import { cn } from "./lib/utils";
import ThemeProvider from "./components/ThemeProvider";

const googleSansFlex = Google_Sans_Flex({
  variable: "--font-google-sans-flex",
  subsets: ["latin"],
  weight: [
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
    "1000",
  ],
});

// const inter = Inter({
//   variable: "--font-inter",
//   subsets: ["latin"],
//   weight: ["400", "500", "600", "700"],
// });

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "RADAR | GDG Babcock",
  description: "Your signal to what's next in the Babcock tech ecosystem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={cn(
          googleSansFlex.variable,
          merriweather.variable,
          caveat.variable,
          "antialiased",
        )}
      >
        <ThemeProvider>
          <Toaster
            theme="dark"
            position="top-right"
            toastOptions={{
              style: {
                background: "#000",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: 500,
              },
            }}
          />
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
