import { NewsletterForm } from "../components";

export default function NewsletterSection() {
  return (
    <section
      id="subscribe"
      className="section-gradient relative py-24 md:py-32"
    >
      <div className="container max-w-2xl mx-auto text-center">
        {/* Icon */}
        <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white/5 border border-white/10">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-400"
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

        {/* Heading - Space Grotesk */}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-heading">
          Don&apos;t Miss a Signal
        </h2>

        {/* Description - Merriweather */}
        <p className="text-gray-400 mb-8 max-w-lg mx-auto font-serif leading-relaxed">
          Join the community. Get the latest tech news, student spotlights, and
          opportunities delivered to your inbox every month.
        </p>

        {/* Newsletter Form */}
        <NewsletterForm />

        {/* Privacy notice */}
        <p className="mt-4 text-xs text-gray-500 uppercase tracking-wider font-body">
          No spam • Unsubscribe anytime
        </p>
      </div>
    </section>
  );
}
