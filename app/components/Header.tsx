"use client";

import Link from "next/link";
import Image from "next/image";
import Button from "./Button";
import { IMAGES, PAGES } from "../lib/constants";
import { IoMoonOutline, IoSunnyOutline } from "react-icons/io5";
import { useTheme } from "./ThemeProvider";

const NAV_LINKS = [
  { label: "Issues", href: "/#issues" },
  { label: "Series", href: PAGES.series },
  { label: "About", href: PAGES.home }, // TODO: point to editorial note when added
  { label: "Team", href: PAGES.team },
  { label: "Submit a Signal", href: "#" },
];

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-transparent backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src={IMAGES.radarLogo.src}
            width={IMAGES.radarLogo.w}
            height={IMAGES.radarLogo.h}
            alt="Radar"
            className="w-20 h-auto"
            priority
          />
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-normal text-gray-300 hover:text-white transition-colors whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-3 ml-auto lg:ml-0">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="items-center justify-center hidden w-9 h-9 rounded-full text-lg text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
          >
            {isDark ? <IoMoonOutline /> : <IoSunnyOutline />}
          </button>

          {/* Subscribe Button */}
          <Button variant="blue" size="sm" href="/#subscribe">
            Subscribe
          </Button>
        </div>
      </div>
    </header>
  );
}
