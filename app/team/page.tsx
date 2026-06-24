export const revalidate = 60;

import Image from "next/image";
import Link from "next/link";
import { Header, Footer } from "../components";
import {
  getTeamRoster,
  getTeamCohorts,
  getTeamCohort,
  urlFor,
} from "../lib/sanity";
import { PAGES } from "../lib/constants";

interface Social {
  label: string;
  url: string;
}

interface Author {
  _id: string;
  name: string;
  slug?: { current: string };
  role?: string;
  course?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image?: any;
  socials?: Social[];
  songObsession?: string;
  tabsCurrentlyOpen?: string;
  currentlyLearning?: string;
  unpopularOpinion?: string;
  techPhilosophy?: string;
}

function MemberAvatar({
  name,
  image,
}: {
  name: string;
  image?: Author["image"];
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2);

  if (image) {
    return (
      <div className="w-20 md:w-35 h-20 md:h-35 rounded-lg overflow-hidden shrink-0 bg-overlay relative">
        <Image
          src={urlFor(image).width(140).height(140).url()}
          alt={image?.alt || name}
          fill
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className="w-20 md:w-35 h-20 md:h-35 rounded-lg overflow-hidden shrink-0 bg-overlay relative">
      <div className="w-full h-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center">
        <span className="text-2xl font-bold text-primary">{initials}</span>
      </div>
    </div>
  );
}

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year } = await searchParams;
  const cohorts = await getTeamCohorts();

  // Prefer the team-cohort model (current year, switchable). Until any cohort
  // exists, fall back to the legacy roster so the page keeps working.
  let teamMembers: Author[];
  let activeLabel: string | null = null;
  if (cohorts.length > 0) {
    const selected = cohorts.find((c) => c.label === year) ?? cohorts[0];
    activeLabel = selected.label;
    const cohort = await getTeamCohort(selected.label);
    teamMembers = (cohort?.members ?? []) as Author[];
  } else {
    teamMembers = await getTeamRoster();
  }
  const isCurrent = (label: string) =>
    cohorts.length > 0 && label === cohorts[0].label;

  return (
    <main className="min-h-screen bg-surface">
      <Header />

      <section className="py-20 px-4">
        <div className="container max-w-275 mx-auto">
          <div className="mb-16">
            <p className="text-content-muted text-[10px] font-bold uppercase leading-3.75 tracking-[4px] mb-6 flex items-center justify-center gap-3 bg-overlay border border-edge rounded-[9999px] w-[291.5px] h-9.25 text-center">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-hover opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
              </span>
              THE CREATIVE COLLECTIVE
            </p>
            <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-[108.8px] tracking-[-6.4px]">
              The Faces
              <br />
              behind
              <br />
              <span>
                <span style={{ color: "var(--color-primary)" }}>R</span>
                <span style={{ color: "var(--color-gdg-red)" }}>A</span>
                <span style={{ color: "var(--color-gdg-yellow)" }}>D</span>
                <span style={{ color: "var(--color-gdg-green)" }}>A</span>
                <span style={{ color: "var(--color-primary)" }}>R.</span>
              </span>
            </h1>
            <div className="border-l-4 border-primary pl-6 max-w-2xl">
              <p className="text-content-secondary text-base md:text-2xl leading-[48.75px] italic">
                &quot;Behind every word, line of statement and piece,
                there&apos;s a voice — a person. This is us — unfiltered, human,
                and learning as we go.&quot;
              </p>
            </div>
            <Link
              href={PAGES.contributors}
              className="mt-6 inline-block text-primary text-xs font-bold uppercase tracking-wider hover:text-primary-hover transition-colors"
            >
              See all contributors, past &amp; present →
            </Link>
          </div>

          {cohorts.length > 1 && (
            <div className="flex flex-wrap items-center gap-2 mb-12">
              <span className="text-content-muted text-[10px] font-bold uppercase tracking-[2px] mr-2">
                Team year
              </span>
              {cohorts.map((c) => {
                const active = c.label === activeLabel;
                return (
                  <Link
                    key={c._id}
                    href={
                      isCurrent(c.label)
                        ? PAGES.team
                        : `${PAGES.team}?year=${encodeURIComponent(c.label)}`
                    }
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                      active
                        ? "border-primary text-primary bg-primary/10"
                        : "border-edge text-content-muted hover:text-content hover:border-edge-strong"
                    }`}
                  >
                    {c.label}
                  </Link>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-20">
            {teamMembers.map((member) => {
              const profileHref = member.slug?.current
                ? PAGES.author(member.slug.current)
                : null;
              return (
                <div
                  key={member._id}
                  className="bg-surface-raised rounded-2xl md:rounded-[48px] p-6 md:p-8 border border-edge"
                >
                  <div className="flex items-start gap-4 md:gap-6 mb-4">
                    {profileHref ? (
                      <Link href={profileHref}>
                        <MemberAvatar name={member.name} image={member.image} />
                      </Link>
                    ) : (
                      <MemberAvatar name={member.name} image={member.image} />
                    )}

                    <div className="flex-1">
                      <h3 className="text-lg md:text-3xl leading-9 tracking-[-0.75px] font-bold text-content mb-1">
                        {profileHref ? (
                          <Link
                            href={profileHref}
                            className="hover:text-primary transition-colors"
                          >
                            {member.name}
                          </Link>
                        ) : (
                          member.name
                        )}
                      </h3>
                      {member.role && (
                        <p className="text-primary text-[10px] md:text-sm leading-5 tracking-[1.4px] font-bold uppercase mb-2">
                          {member.role}
                        </p>
                      )}
                      {member.course && (
                        <p className="text-content-muted text-[8px] md:text-[10px] leading-3.75 tracking-[1.4px] font-semibold uppercase mb-2">
                          {member.course}
                        </p>
                      )}
                      {member.socials && member.socials.length > 0 && (
                        <div className="flex gap-2 flex-wrap font-bold text-[10px] leading-3.75 underline decoration-[#FFFFFF1A] decoration-0 underline-offset-4">
                          {member.socials.map((social) => (
                            <a
                              key={`${social.label}-${social.url}`}
                              href={social.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-content-muted hover:text-primary transition-colors"
                            >
                              {social.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <hr className="mb-6 md:mb-8 text-edge" />

                  <div className="grid grid-cols-2 gap-4 md:gap-6 text-xs">
                    {member.songObsession && (
                      <div>
                        <p className="text-content-muted uppercase leading-[13.5px] tracking-[1.8PX] font-bold text-[9px] mb-1.5">
                          NEW SONG OBSESSION
                        </p>
                        <p className="text-content-secondary font-medium text-[13px] leading-[19.5px]">
                          {member.songObsession}
                        </p>
                      </div>
                    )}

                    {member.tabsCurrentlyOpen && (
                      <div>
                        <p className="text-content-muted uppercase leading-[13.5px] tracking-[1.8PX] font-bold text-[9px] mb-1.5">
                          TABS CURRENTLY OPEN
                        </p>
                        <p className="text-content-secondary font-medium text-[13px] leading-[19.5px]">
                          {member.tabsCurrentlyOpen}
                        </p>
                      </div>
                    )}

                    {member.currentlyLearning && (
                      <div>
                        <p className="text-content-muted uppercase leading-[13.5px] tracking-[1.8PX] font-bold text-[9px] mb-1.5">
                          WHAT I&apos;M LEARNING RIGHT NOW
                        </p>
                        <p className="text-content-secondary font-medium text-[13px] leading-[19.5px]">
                          {member.currentlyLearning}
                        </p>
                      </div>
                    )}

                    {member.unpopularOpinion && (
                      <div>
                        <p className="text-content-muted uppercase leading-[13.5px] tracking-[1.8PX] font-bold text-[9px] mb-1.5">
                          UNPOPULAR DEV OPINION / HOT TAKE
                        </p>
                        <p className="text-content-secondary font-medium text-[13px] leading-[19.5px]">
                          {member.unpopularOpinion}
                        </p>
                      </div>
                    )}

                    {member.techPhilosophy && (
                      <div>
                        <p className="text-content-muted uppercase leading-[13.5px] tracking-[1.8PX] font-bold text-[9px] mb-1.5">
                          TECH PHILOSOPHY
                        </p>
                        <p className="text-content-secondary font-medium text-[13px] leading-[19.5px]">
                          {member.techPhilosophy}
                        </p>
                      </div>
                    )}
                  </div>

                  {profileHref && (
                    <Link
                      href={profileHref}
                      className="mt-6 inline-block text-primary text-xs font-bold uppercase tracking-wider hover:text-primary-hover transition-colors"
                    >
                      View profile &amp; articles →
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-surface-raised border border-edge rounded-3xl mx-auto max-w-346 md:h-[967.78px] flex flex-col justify-center p-12 mb-12">
          <p
            className="text-content-muted text-lg md:text-4xl leading-[48.75px] text-center max-w-265.75 mx-auto italic mb-12"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            &quot;What stands out isn&apos;t just what we study or what we
            build, but who we are while doing it. We manage pressure
            differently. We find meaning in different things. We recharge in our
            own ways. And yet, we come together as a community driven by
            curiosity, growth, and the desire to build something meaningful and
            we hope that you enjoy this RADAR issue as much as we do!.&quot;
          </p>

          <span className="flex justify-center my-3">
            <hr className="w-16 text-primary" />
          </span>

          <div className="text-center">
            <h2
              className="text-5xl md:text-6xl lg:text-7xl leading-24 text-primary mb-2 -rotate-2"
              style={{ fontFamily: "var(--font-caveat)" }}
            >
              Commit & Push
            </h2>
            <p className="text-content-subtle font-bold text-xs leading-4.5 uppercase tracking-[7.2px]">
              THE GDG CREATIVE WRITING TEAM
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
