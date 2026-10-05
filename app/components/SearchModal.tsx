"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { IoSearch, IoClose } from "react-icons/io5";
import { urlFor } from "../lib/sanity";
import { PAGES } from "../lib/constants";

interface AuthorResult {
  _id: string;
  name: string;
  slug?: { current: string };
  role?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image?: any;
}

interface ContentResult {
  kind: "article" | "post";
  _id: string;
  title: string;
  excerpt?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image?: any;
  publishedAt?: string;
  href: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2);
}

export default function SearchModal({
  isOpen,
  onClose,
  initialQuery = "",
}: SearchModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<ContentResult[]>([]);
  const [authors, setAuthors] = useState<AuthorResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync initial query when opened
  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      if (initialQuery.trim()) {
        fetchResults(initialQuery);
      }
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initialQuery]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Live debounced search
  useEffect(() => {
    if (!isOpen) return;

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setAuthors([]);
      setLoading(false);
      setSearched(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      fetchResults(trimmed);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const fetchResults = async (q: string) => {
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
        setAuthors(data.authors || []);
      }
    } catch {
      // Keep silent on error
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  if (!isOpen) return null;

  const total = results.length + authors.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 sm:px-6">
      {/* Blurred backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search RADAR"
        className="relative z-10 w-full max-w-2xl rounded-2xl border border-edge bg-surface shadow-2xl flex flex-col overflow-hidden max-h-[82vh] animate-in zoom-in-95 duration-200"
      >
        {/* Search input header */}
        <div className="flex items-center gap-3 border-b border-edge px-4 py-3.5 bg-surface-raised/50">
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 text-primary shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <IoSearch className="text-content-muted text-xl shrink-0" />
          )}

          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search RADAR articles, topics & contributors…"
            className="flex-1 bg-transparent text-lg font-medium text-content placeholder:text-content-subtle focus:outline-none min-w-0"
          />
        </div>

        {/* Modal Results Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {!query.trim() && (
            <div className="py-8 text-center">
              <p className="text-content-muted text-sm">
                Type a keyword, topic, or contributor name to search across RADAR.
              </p>
            </div>
          )}

          {searched && !loading && query.trim() && total === 0 && (
            <div className="py-10 text-center">
              <p className="text-content-muted text-base">
                No results found for <span className="text-content font-semibold">“{query}”</span>
              </p>
              <p className="text-xs text-content-subtle mt-1">
                Try checking for typos or using different keywords.
              </p>
            </div>
          )}

          {/* Contributors Section */}
          {authors.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[2px] text-content-subtle mb-3">
                Contributors ({authors.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {authors.map((a) => (
                  <Link
                    key={a._id}
                    href={
                      a.slug?.current
                        ? PAGES.author(a.slug.current)
                        : PAGES.contributors
                    }
                    onClick={onClose}
                    className="group flex items-center gap-3 rounded-xl border border-edge bg-surface-raised p-3 hover:border-primary transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-overlay relative">
                      {a.image ? (
                        <Image
                          src={urlFor(a.image).width(80).height(80).url()}
                          alt={a.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-primary">
                          {initials(a.name)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-content truncate group-hover:text-primary transition-colors">
                        {a.name}
                      </p>
                      {a.role && (
                        <p className="text-[11px] uppercase tracking-wider text-content-muted truncate">
                          {a.role}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Articles Section */}
          {results.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[2px] text-content-subtle mb-3">
                Articles ({results.length})
              </h3>
              <div className="flex flex-col gap-3">
                {results.map((r) => (
                  <Link
                    key={r._id}
                    href={r.href}
                    onClick={onClose}
                    className="group flex items-start gap-4 rounded-xl border border-edge bg-surface-raised p-3.5 hover:border-primary transition-colors"
                  >
                    {r.image && (
                      <div className="hidden sm:block relative w-20 h-16 rounded-lg overflow-hidden shrink-0 bg-overlay">
                        <Image
                          src={urlFor(r.image).width(160).height(128).url()}
                          alt={r.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-sm text-content leading-snug group-hover:text-primary transition-colors">
                        {r.title}
                      </h4>
                      {r.excerpt && (
                        <p className="mt-1 text-xs text-content-muted line-clamp-2 leading-relaxed">
                          {r.excerpt}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-edge bg-surface-raised/40 px-4 py-2.5 flex items-center justify-between text-xs text-content-subtle">
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-overlay border border-edge text-[10px] font-mono">ESC</kbd> to close</span>
          <span className="flex items-center justify-center gap-1">
            RADAR Search
            <span>
              <button
                onClick={onClose}
                aria-label="Close search modal"
                className="flex items-center justify-center w-8 h-8 rounded-full text-content-muted hover:text-content hover:bg-overlay-strong transition-all cursor-pointer shrink-0"
              >
                <IoClose className="text-xl" />
              </button>
            </span>
          </span>

        </div>
      </div>
    </div>
  );
}
