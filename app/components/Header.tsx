"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Button from "./Button";
import SearchModal from "./SearchModal";
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
  const { member, isAuthenticated, loading: authLoading, signOut, openSignIn } =
    useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  // Cmd+K or Ctrl+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchModalOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-edge bg-surface/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src={IMAGES.radarLogo.src}
              width={IMAGES.radarLogo.w}
              height={IMAGES.radarLogo.h}
              alt="Radar"
              className="w-16 sm:w-20 h-auto theme-invert"
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
            {/* Search bar on desktop */}
            <button
              onClick={() => {
                setSearchModalOpen(true);
                setMenuOpen(false);
                setAccountOpen(false);
              }}
              aria-label="Search RADAR"
              className="hidden md:flex items-center gap-2.5 h-9 rounded-full border border-edge bg-overlay/50 px-3.5 text-xs text-content-muted hover:border-edge-strong hover:text-content hover:bg-overlay transition-all cursor-pointer"
            >
              <IoSearch className="text-sm shrink-0" />
              <span className="font-medium lg:truncate">Search RADAR…</span>
              <kbd className="hidden md:flex justify-center items-center rounded border border-edge bg-surface px-1.5 py-1 text-xs font-mono text-content-subtle">
                ⌘/Ctrl K
              </kbd>
            </button>

            {/* Search icon button on mobile */}
            <button
              onClick={() => {
                setSearchModalOpen(true);
                setMenuOpen(false);
                setAccountOpen(false);
              }}
              aria-label="Search"
              className="flex md:hidden items-center justify-center w-6 sm:w-9 h-6 sm:h-9 rounded-full text-lg text-content-muted hover:text-content hover:bg-overlay-strong transition-all duration-200 cursor-pointer"
            >
              <IoSearch />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="flex items-center justify-center w-6 sm:w-9 h-6 sm:h-9 rounded-full text-lg text-content-muted hover:text-content hover:bg-overlay-strong transition-all duration-200 cursor-pointer"
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
                <span className="text-xs sm:text-sm font-medium">Sign in</span>
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

            {/* Subscribe Button */}
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
              className="flex lg:hidden items-center justify-center w-6 sm:w-9 h-6 sm:h-9 rounded-full text-xl text-content-muted hover:text-content hover:bg-overlay-strong transition-all duration-200 cursor-pointer"
            >
              {menuOpen ? <IoClose /> : <IoMenu />}
            </button>
          </div>
        </div>

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

      {/* Global Search Modal Overlay */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </>
  );
}
