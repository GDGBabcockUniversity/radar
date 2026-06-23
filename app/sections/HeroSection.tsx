import Image from "next/image";
import { Button } from "../components";
import { IMAGES, LINKS } from "../lib/constants";

interface HeroSectionProps {
  heroHref?: string;
}

export default function HeroSection({ heroHref }: HeroSectionProps) {
  return (
    <section className="hero-section relative overflow-hidden flex flex-col items-center justify-center text-center min-h-[90vh] px-4">
      {/* Radar signal background image */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Image
          src={IMAGES.radarSignalBg.src}
          width={IMAGES.radarSignalBg.w}
          height={IMAGES.radarSignalBg.h}
          alt=""
          className="w-[90%] max-w-225 h-auto opacity-70"
          priority
          aria-hidden="true"
        />
      </div>

      {/* Blue cone sweep at bottom */}
      <div className="hero-cone" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto">
        {/* Large Radar logo wordmark */}
        <div className="mb-4">
          <Image
            src={IMAGES.radarLogo.src}
            width={IMAGES.radarLogo.w}
            height={IMAGES.radarLogo.h}
            alt="Radar"
            className="h-24 md:h-32 lg:h-40 w-auto"
            priority
          />
        </div>

        {/* Divider + subtitle */}
        <div className="flex flex-col items-center gap-4 mb-10 md:mb-12">
          <div className="w-64 md:w-80 h-px bg-white/20" />
          <p className="text-md md:text-lg uppercase tracking-widest text-white font-medium border-y py-2">
            The Official Record of the Babcock Tech Ecosystem
          </p>
        </div>

        {/* Tagline */}
        <p className="text-xl md:text-2xl lg:text-3xl italic font-extrabold uppercase leading-snug mb-10 md:mb-12 text-white max-w-2xl">
          Tracking the signals, projects, and people shaping the Babcock tech
          ecosystem.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button
            variant="blue"
            size="md"
            href={heroHref ?? "#featured"}
            showArrow
          >
            Read Latest Issue
          </Button>
          <Button
            variant="outlined"
            size="md"
            href={LINKS.youtubePlaylist}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-black"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="opacity-80 text-gdg-red"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            Watch Class of 2026
          </Button>
        </div>
      </div>
    </section>
  );
}
