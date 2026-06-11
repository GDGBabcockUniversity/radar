import Image from "next/image";
import { Button } from "../components";
import { LINKS } from "../lib/constants";

const TAGS = [
  "Weekly",
  "Video + Write-Up",
  "Graduation Countdown",
  "YouTube Launch",
];

export default function SpotlightSection() {
  return (
    <section className="spotlight-section py-16 md:py-24">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left — Text content */}
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-5">
              Class of 2026 <span className="text-[#e84a35]">Spotlight</span>
            </h2>

            <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-8 max-w-lg">
              A weekly graduation countdown series featuring short videos and
              write-ups from the graduating class. It keeps RADAR active between
              issues and launches the publication&apos;s YouTube presence.
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {TAGS.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-semibold uppercase tracking-wider text-gray-300"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e84a35]" />
                  {tag}
                </span>
              ))}
            </div>

            {/* CTA */}
            <Button variant="blue" size="md" href={LINKS.youtubePlaylist} target="_blank" rel="noopener noreferrer">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="opacity-90"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch the Series
            </Button>
          </div>

          {/* Right — Video thumbnail */}
          <a
            href={LINKS.youtubePlaylist}
            target="_blank"
            rel="noopener noreferrer"
            className="relative aspect-video rounded-xl overflow-hidden group cursor-pointer block"
          >
            <Image
              src="https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=450&fit=crop"
              width={800}
              height={450}
              alt="Class of 2026 Spotlight"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/30 transition-opacity group-hover:bg-black/20" />

            {/* YouTube play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-11 bg-[#FF0000] rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="white"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
