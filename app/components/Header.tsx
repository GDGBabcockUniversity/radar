"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "./Button";
import { IMAGES, PAGES, LINKS } from "../lib/constants";
import {
  IoMoonOutline,
  IoSunnyOutline,
  IoSearch,
  IoMenu,
  IoClose,
  IoPersonCircleOutline,
} from "react-icons/io5";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "./AuthProvider";
import { cn } from "../lib/utils";

const NAV_LINKS = [
  { label: "Issues", href: PAGES.issues },
  { label: "Series", href: PAGES.series },
  { label: "Games", href: PAGES.games },
  { label: "About", href: PAGES.about },
  { label: "Team", href: PAGES.team },
  { label: "Submit a Signal", href: LINKS.contactEmail },
];

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();
  const { member, isAuthenticated, loading: authLoading, signOut, openSignIn } =
    useAuth();

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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-edge bg-surface/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src={IMAGES.radarLogo.src}
            width={IMAGES.radarLogo.w}
            height={IMAGES.radarLogo.h}
            alt="Radar"
            className="w-20 h-auto theme-invert"
            priority
          />
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-normal text-content-secondary hover:text-content transition-colors whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto lg:ml-0">
          {/* Search toggle */}
          <button
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search"
            aria-expanded={searchOpen}
            className="flex items-center justify-center w-9 h-9 rounded-full text-lg text-content-muted hover:text-content hover:bg-overlay-strong transition-all duration-200 cursor-pointer"
          >
            <IoSearch />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="flex items-center justify-center w-9 h-9 rounded-full text-lg text-content-muted hover:text-content hover:bg-overlay-strong transition-all duration-200 cursor-pointer"
          >
            {isDark ? <IoMoonOutline /> : <IoSunnyOutline />}
          </button>

          {/* Account */}
          {!authLoading && (
            <button
              onClick={() => (isAuthenticated ? signOut() : openSignIn())}
              aria-label={isAuthenticated ? `Sign out (${member?.name || member?.email})` : "Sign in"}
              title={isAuthenticated ? `Signed in as ${member?.name || member?.email} — click to sign out` : "Sign in"}
              className={cn(
                "flex items-center gap-1.5 h-9 rounded-full text-content-muted hover:text-content hover:bg-overlay-strong transition-all duration-200 cursor-pointer",
                isAuthenticated ? "w-9 justify-center text-lg" : "px-3 text-lg"
              )}
            >
              <IoPersonCircleOutline
                className={isAuthenticated ? "text-primary" : undefined}
              />
              {!isAuthenticated && (
                <span className="text-sm font-medium">Sign in</span>
              )}
            </button>
          )}

          {/* Subscribe Button (hidden on smallest screens to save room) */}
          <div className="hidden sm:block">
            <Button variant="blue" size="sm" href="/#subscribe">
              Subscribe
            </Button>
          </div>

          {/* Hamburger (mobile only) */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex lg:hidden items-center justify-center w-9 h-9 rounded-full text-xl text-content-muted hover:text-content hover:bg-overlay-strong transition-all duration-200 cursor-pointer"
          >
            {menuOpen ? <IoClose /> : <IoMenu />}
          </button>
        </div>
      </div>

      {/* Search bar (toggled) */}
      {searchOpen && (
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
      )}

      {/* Mobile menu (toggled) */}
      {menuOpen && (
        <div className="lg:hidden border-t border-edge bg-surface/95 backdrop-blur-md">
          <nav className="container flex flex-col py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="py-2.5 text-sm font-medium text-content-secondary hover:text-content transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3">
              <Button variant="blue" size="sm" href="/#subscribe">
                Subscribe
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
