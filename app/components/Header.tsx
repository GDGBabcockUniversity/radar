import Link from "next/link";
import Button from "./Button";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-transparent backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          {/* Signal Icon */}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path
                d="M12 12V12.01M8.5 8.5C9.39 7.61 10.63 7 12 7C13.37 7 14.61 7.61 15.5 8.5M5.5 5.5C7.21 3.79 9.47 2.75 12 2.75C14.53 2.75 16.79 3.79 18.5 5.5M12 17V21M8 21H16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-white font-heading">
              RADAR
            </span>
            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-heading">
              By GDG Babcock
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-8 md:flex font-body">
          <Link
            href="/latest"
            className="text-sm font-medium text-white hover:text-primary transition-colors"
          >
            Latest
          </Link>
          <Link
            href="/archive"
            className="text-sm font-medium text-white hover:text-primary transition-colors"
          >
            Archive
          </Link>
        </nav>

        {/* Subscribe Button */}
        <Button variant="outlined" size="sm" href="#subscribe">
          Subscribe
        </Button>
      </div>
    </header>
  );
}
