"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { IMAGES, PAGES, LINKS } from "../lib/constants";
import {
  IoMoonOutline,
  IoSunnyOutline,
  IoSearch,
  IoMenu,
  IoClose,
} from "react-icons/io5";
import { useTheme } from "./ThemeProvider";

const NAV_LINKS = [
  { label: "Issues", href: PAGES.issues },
  { label: "Series", href: PAGES.series },
  { label: "Games", href: PAGES.games },
  { label: "About", href: PAGES.about },
  { label: "Team", href: PAGES.team },
  { label: "Submit a Signal", href: LINKS.contactEmail },
];

// Chat-bubble colors for the mobile menu (GDG brand tokens, cycled).
const BUBBLE_COLORS = [
  "var(--color-primary)",
  "var(--color-gdg-red)",
  "var(--color-gdg-yellow)",
  "var(--color-gdg-green)",
];
const isYellow = (c: string) => c === "var(--color-gdg-yellow)";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const isLight = !isDark;
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSearchOpen(false);
    setMenuOpen(false);
    router.push(`${PAGES.search}?q=${encodeURIComponent(q)}`);
  };

  const comingSoon = () => toast("Member accounts are coming soon.");

  // In light mode the header is a dark floating pill; in dark mode it's the
  // existing transparent bar. Either way the interior sits on a dark surface,
  // so its content is styled light-on-dark uniformly.
  const iconBtn = `flex items-center justify-center w-9 h-9 rounded-full text-lg transition-all duration-200 cursor-pointer ${
    isLight
      ? "text-white/70 hover:text-white hover:bg-white/10"
      : "text-content-muted hover:text-content hover:bg-overlay-strong"
  }`;
  const navLink = `px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
    isLight
      ? "text-white/70 hover:text-white hover:bg-white/10"
      : "text-content-secondary hover:text-content"
  }`;

  return (
    <header
      className={
        isLight
          ? "sticky top-3 z-50 px-4"
          : "sticky top-0 z-50 w-full border-b border-edge bg-surface/80 backdrop-blur-md"
      }
    >
      <div
        className={
          isLight
            ? "mx-auto max-w-[1200px] flex h-14 items-center justify-between gap-4 rounded-full bg-[#0f0f0f]/95 backdrop-blur-md px-4 sm:px-5 shadow-[0_10px_40px_rgba(0,0,0,0.15)]"
            : "container flex h-16 items-center justify-between gap-6"
        }
      >
        {/* Logo — always white (header interior is dark in both modes) */}
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

        {/* Desktop navigation (inner capsule in light mode) */}
        <nav className="hidden lg:flex">
          <div
            className={
              isLight
                ? "flex items-center gap-1 rounded-full bg-white/5 px-2 py-1"
                : "flex items-center gap-5"
            }
          >
            {NAV_LINKS.map((link) => (
              <Link key={link.label} href={link.href} className={navLink}>
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto lg:ml-0">
          <button
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search"
            aria-expanded={searchOpen}
            className={iconBtn}
          >
            <IoSearch />
          </button>

          <button
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className={iconBtn}
          >
            {isDark ? <IoMoonOutline /> : <IoSunnyOutline />}
          </button>

          {/* Sign In stub */}
          <button
            onClick={comingSoon}
            className="hidden sm:inline-flex items-center rounded-full h-9 px-4 text-sm font-medium bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            Sign In
          </button>

          {/* Subscribe */}
          <Link
            href="/#subscribe"
            className="hidden sm:inline-flex items-center rounded-full h-9 px-4 text-sm font-medium bg-primary text-white hover:bg-primary-hover transition-colors"
          >
            Subscribe
          </Link>

          {/* Hamburger (mobile only) */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className={`${iconBtn} lg:hidden`}
          >
            {menuOpen ? <IoClose /> : <IoMenu />}
          </button>
        </div>
      </div>

      {/* Search bar (toggled) */}
      {searchOpen &&
        (isLight ? (
          <div className="px-4 mt-2">
            <form
              onSubmit={submitSearch}
              className="mx-auto max-w-[1200px] flex items-center gap-3 rounded-full bg-[#0f0f0f]/95 backdrop-blur-md px-5 py-3"
            >
              <IoSearch className="text-white/60 text-lg shrink-0" />
              <input
                autoFocus
                type="search"
                name="q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles and contributors…"
                className="flex-1 bg-transparent text-white placeholder:text-white/40 focus:outline-none text-sm"
              />
              <button
                type="submit"
                className="text-xs font-semibold uppercase tracking-wider text-primary hover:text-primary-hover transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        ) : (
          <div className="border-t border-edge bg-surface/95 backdrop-blur-md">
            <form
              onSubmit={submitSearch}
              className="container flex items-center gap-3 py-3"
            >
              <IoSearch className="text-content-muted text-lg shrink-0" />
              <input
                autoFocus
                type="search"
                name="q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles and contributors…"
                className="flex-1 bg-transparent text-content placeholder:text-content-subtle focus:outline-none text-sm"
              />
              <button
                type="submit"
                className="text-xs font-semibold uppercase tracking-wider text-primary hover:text-primary-hover transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        ))}

      {/* Mobile menu — dark bubble panel (both themes) */}
      {menuOpen && (
        <div className="lg:hidden px-4 mt-2">
          <div className="rounded-3xl bg-[#0f0f0f] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
            {/* Panel header */}
            <div className="flex items-center justify-between mb-6">
              <Image
                src={IMAGES.radarLogo.src}
                width={IMAGES.radarLogo.w}
                height={IMAGES.radarLogo.h}
                alt="Radar"
                className="w-16 h-auto"
              />
              <div className="flex items-center gap-2">
                <button onClick={toggleTheme} aria-label="Toggle theme" className={iconBtn}>
                  {isDark ? <IoMoonOutline /> : <IoSunnyOutline />}
                </button>
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  className={iconBtn}
                >
                  <IoClose />
                </button>
              </div>
            </div>

            {/* Colorful bubble nav */}
            <div className="flex flex-col items-end gap-3">
              {NAV_LINKS.map((link, i) => {
                const color = BUBBLE_COLORS[i % BUBBLE_COLORS.length];
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="inline-flex rounded-full px-5 py-2.5 text-sm font-semibold"
                    style={{
                      background: color,
                      color: isYellow(color) ? "#1c1a14" : "#ffffff",
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <button
                onClick={() => {
                  setMenuOpen(false);
                  comingSoon();
                }}
                className="inline-flex rounded-full px-5 py-2.5 text-sm font-semibold bg-white/10 text-white"
              >
                Sign In
              </button>

              <Link
                href="/#subscribe"
                onClick={() => setMenuOpen(false)}
                className="inline-flex rounded-full px-5 py-2.5 text-sm font-semibold bg-white text-black"
              >
                Subscribe
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
