"use client";

import { useState } from "react";
import { FaWhatsapp, FaXTwitter, FaLinkedinIn, FaLink } from "react-icons/fa6";
import { BASE_URL } from "../lib/constants";

interface ShareButtonsProps {
  /** Root-relative path to share, e.g. "/articles/foo". */
  path: string;
  /** Title used as prefilled text on platforms that support it. */
  title: string;
  className?: string;
}

// Reusable share row for article and issue pages. These buttons share the
// canonical link; the rich preview card comes from the page's OG meta tags
// (see buildOgMetadata) — the two mechanisms are separate.
export default function ShareButtons({
  path,
  title,
  className = "",
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;

  const shareText = `${title} — RADAR`;
  const targets = [
    {
      label: "Share on WhatsApp",
      icon: FaWhatsapp,
      href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`,
    },
    {
      label: "Share on X",
      icon: FaXTwitter,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareText,
      )}&url=${encodeURIComponent(url)}`,
    },
    {
      label: "Share on LinkedIn",
      icon: FaLinkedinIn,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        url,
      )}`,
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable; fail quietly.
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mr-1">
        Share
      </span>
      {targets.map(({ label, icon: Icon, href }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 transition-colors hover:border-primary hover:text-primary"
        >
          <Icon className="h-4 w-4" />
        </a>
      ))}
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy link"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 transition-colors hover:border-primary hover:text-primary"
      >
        <FaLink className="h-4 w-4" />
      </button>
      {copied && (
        <span className="text-xs text-primary" role="status">
          Copied!
        </span>
      )}
    </div>
  );
}
