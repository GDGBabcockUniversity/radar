import { LiveBadge, Button } from "../components";

export default function HeroSection() {
  return (
    <section className="section-gradient relative pt-24 pb-16 md:pt-32 md:pb-20">
      <div className="container flex flex-col items-center text-center">
        {/* Live Badge */}
        <LiveBadge date="December 20, 2025" className="mb-8" />

        {/* Main Logo */}
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 text-white font-heading">
          RADAR
          <span className="text-primary">.</span>
        </h1>

        {/* Tagline - Merriweather (serif) */}
        <p className="text-xl md:text-2xl text-gray-300 max-w-lg mb-10 font-serif leading-relaxed">
          Your signal to{" "}
          <span className="text-primary font-medium">what&apos;s next</span> in
          the Babcock tech ecosystem.
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
