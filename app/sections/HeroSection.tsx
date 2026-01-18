import { LiveBadge, Button } from "../components";

export default function HeroSection() {
  return (
    <section
      className="relative py-16 md:py-24"
      style={{
        background:
          "linear-gradient(180deg, #0A0A0A 0%, #111827 50%, #0A0A0A 100%)",
      }}
    >
      <div className="container flex flex-col items-center text-center">
        {/* Live Badge */}
        <LiveBadge date="December 20, 2025" className="mb-6" />

        {/* Main Logo */}
        <h1
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 text-white"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          RADAR
          <span className="text-[var(--color-primary)]">.</span>
        </h1>

        {/* Tagline */}
        <p
          className="text-lg md:text-xl text-[var(--color-text-muted)] max-w-md mb-8"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Your signal to{" "}
          <span className="text-[var(--color-primary)] font-medium">
            what&apos;s next
          </span>{" "}
          in the Babcock tech ecosystem.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button variant="outlined" size="md" href="#featured" showArrow>
            Read Latest Edition
          </Button>
          <Button variant="ghost" size="md" href="#editions">
            Browse Archives
          </Button>
        </div>
      </div>
    </section>
  );
}
