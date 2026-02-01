import { LiveBadge, Button } from "../components";
import { getTodaysDate } from "../lib/utils";

export default function HeroSection() {
  const date = getTodaysDate();

  return (
    <section
      className="relative pt-24 pb-16 md:pt-32 md:pb-20"
      style={{
        background:
          "radial-gradient(ellipse at center, #1a2744 0%, #0a0a0a 70%)",
      }}
    >
      <div className="container flex flex-col items-center text-center">
        {/* Live Badge */}
        <LiveBadge date={date} className="mb-8" />

        {/* Main Logo - Space Grotesk */}
        <h1
          className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 text-white"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <span>
            <span style={{ color: "var(--color-primary)" }}>R</span>
            <span style={{ color: "var(--color-gdg-red)" }}>A</span>
            <span style={{ color: "var(--color-gdg-yellow)" }}>D</span>
            <span style={{ color: "var(--color-gdg-green)" }}>A</span>
            <span style={{ color: "var(--color-primary)" }}>R.</span>
          </span>
        </h1>

        {/* Tagline - Merriweather (serif) */}
        <p
          className="text-xl md:text-2xl text-gray-300 max-w-lg mb-10 leading-relaxed"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Your signal to{" "}
          <span className="text-primary font-medium">what&apos;s next</span> in
          the Babcock tech ecosystem.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button variant="primary" size="sm" href="#featured" showArrow>
            Read Latest Edition
          </Button>
          <Button variant="ghost" size="sm" href="#editions">
            Browse Archives
          </Button>
        </div>
      </div>
    </section>
  );
}
