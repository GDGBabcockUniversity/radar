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
  const [accountOpen, setAccountOpen] = useState(false);
  const [query, setQuery] = useState("");

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSearchOpen(false);
    setMenuOpen(false);
    setQuery("");
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
            onClick={() => {
              setSearchOpen((v) => !v);
              setMenuOpen(false);
              setAccountOpen(false);
            }}
            aria-label={searchOpen ? "Close search" : "Search"}
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
          {!authLoading && !isAuthenticated && (
            <button
              onClick={() => openSignIn()}
              aria-label="Sign in"
              title="Sign in"
              className="flex items-center gap-1.5 h-9 rounded-full px-3 text-lg text-content-muted hover:text-content hover:bg-overlay-strong transition-all duration-200 cursor-pointer"
            >
              <IoPersonCircleOutline />
              <span className="text-sm font-medium">Sign in</span>
            </button>
          )}
          {!authLoading && isAuthenticated && (
            <div className="relative">
              <button
                onClick={() => setAccountOpen((v) => !v)}
                aria-label={`Account (${member?.name || member?.email})`}
                aria-expanded={accountOpen}
                className="flex items-center gap-1.5 h-9 rounded-full px-2 sm:px-3 text-lg text-content-muted hover:text-content hover:bg-overlay-strong transition-all duration-200 cursor-pointer"
              >
                <IoPersonCircleOutline className="text-primary" />
                <span className="hidden sm:inline text-sm font-medium text-content max-w-24 truncate">
                  {member?.name?.split(" ")[0] || "Account"}
                </span>
              </button>
              {accountOpen && (
                <>
                  <button
                    aria-label="Close account menu"
                    onClick={() => setAccountOpen(false)}
                    className="fixed inset-0 z-40 cursor-default"
                  />
                  <div className="absolute right-0 top-11 z-50 w-56 rounded-xl border border-edge bg-surface p-2 shadow-xl">
                    <p className="px-3 py-2 text-xs text-content-subtle">
                      Signed in as
                      <span className="mt-0.5 block truncate text-sm font-medium text-content">
                        {member?.name || member?.email}
                      </span>
                    </p>
                    <a
                      href="https://gdgbabcock.com/profile"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg px-3 py-2 text-sm text-content-secondary hover:bg-overlay-strong hover:text-content transition-colors"
                    >
                      Your profile
                    </a>
                    <button
                      onClick={() => {
                        setAccountOpen(false);
                        signOut();
                      }}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-content-secondary hover:bg-overlay-strong hover:text-content transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Subscribe Button (hidden on smallest screens to save room) */}
          <div className="hidden sm:block">
            <Button variant="blue" size="sm" href="/#subscribe">
              Subscribe
            </Button>
          </div>

          {/* Hamburger (mobile only) */}
          <button
            onClick={() => {
              setMenuOpen((v) => !v);
              setSearchOpen(false);
            }}
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
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setSearchOpen(false);
                setQuery("");
              }
            }}
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
