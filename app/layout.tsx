import type { Metadata } from "next";
import { Space_Grotesk, Inter, Merriweather, Caveat } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["400", "700"],
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
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${merriweather.variable} ${caveat.variable} antialiased`}
      >
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
      </body>
    </html>
  );
}
