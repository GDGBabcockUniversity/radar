import Link from "next/link";
import Button from "./Button";
import Image from "next/image";
import { IMAGES } from "../lib/constants";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-transparent backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group mr-auto">
          {/* Signal Icon */}
          {/* <div className="flex h-10 w-10 items-center justify-center rounded-lg"> */}
          <Image
            src={IMAGES.logo.src}
            width={IMAGES.logo.w}
            height={IMAGES.logo.h}
            alt="Logo"
            className="w-10 h-10"
          />
          {/* </div> */}
          <div className="flex flex-col">
            <span
              className="text-sm font-bold tracking-tight text-white"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              RADAR
            </span>
            <span
              className="text-[9px] uppercase tracking-wider text-gray-400"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              By GDG Babcock
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav
          className="hidden items-center gap-8 md:flex"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {/* <Link
            href="/"
            className="text-sm font-medium text-white hover:text-primary transition-colors"
          >
            Latest
          </Link>
          <Link
            href="/archive"
            className="text-sm font-medium text-white hover:text-primary transition-colors"
          >
            Archive
          </Link> */}
          <Link
            href="/team"
            className="text-sm font-medium text-white hover:text-primary transition-colors"
          >
            Team
          </Link>
        </nav>

        {/* Subscribe Button */}
        <Button
          variant="primary"
          size="sm"
          href="#subscribe"
          className="text-black"
        >
          Subscribe
        </Button>
      </div>
    </header>
  );
}
