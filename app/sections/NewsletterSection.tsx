import Image from "next/image";
import { NewsletterForm } from "../components";
import { IMAGES } from "../lib/constants";

export default function NewsletterSection() {
  return (
    <section
      id="subscribe"
      className="newsletter-section relative flex justify-center px-6 py-16 md:py-24"
    >
      <div className="flex w-full max-w-2xl flex-col items-center text-center">
        {/* Envelope Icon */}
        <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-surface-raised border border-edge">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="text-primary"
          >
            <path
              d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Heading */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-content mb-4">
          Get{" "}
          <Image
            src={IMAGES.radarLogo.src}
            width={IMAGES.radarLogo.w}
            height={IMAGES.radarLogo.h}
            alt="Radar"
            className="inline-block h-[1em] w-auto align-middle mx-1 -translate-y-[0.04em] theme-invert"
          />{" "}
          in your inbox
        </h2>

        {/* Subtitle */}
        <p className="text-content-muted mb-10 max-w-lg mx-auto leading-relaxed text-sm md:text-base">
          Monthly issues, weekly series drops, and the signals students should
          not miss.
        </p>

        {/* Newsletter Form */}
        <NewsletterForm />

        {/* Privacy notice */}
        <p className="mt-5 text-[10px] text-content-subtle uppercase tracking-[0.2em] font-medium">
          No spam. Just signal. Unsubscribe anytime
        </p>
      </div>
    </section>
  );
}
