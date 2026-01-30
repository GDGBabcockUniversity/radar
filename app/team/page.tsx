import Image from "next/image";
import { Header, Footer } from "../components";

interface SocialLinks {
  medium?: string;
  snapchat?: string;
  substack?: string;
  x?: string;
  instagram?: string;
}

interface TeamMember {
  name: string;
  role: string;
  course: string;
  image: string;
  quote: string;
  socialLinks?: SocialLinks;
  songObsession: string;
  favoriteBook: string;
  favoriteColor: string;
  howIUnwind: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Itamah Osedebame",
    role: "RADAR TEAM LEAD",
    course: "COMPUTER SCIENCE",
    image: "/team/itamah.jpg",
    quote: "Younger me was interested in law. Now, I'm building what matters.",
    socialLinks: {
      snapchat: "https://snapchat.com/add/itamah",
      substack: "https://itamah.substack.com",
    },
    songObsession: "D.T.M.M.B by Indi",
    favoriteBook: "Harry Potter (J.K. Rowling)",
    favoriteColor: "Red, Black, Brown",
    howIUnwind: "Music and sleep",
  },
  {
    name: "E. Oghenetejiri",
    role: "EDITOR, GDG BABCOCK MEDIA & MARKETING LEAD",
    course: "SOFTWARE ENGINEERING",
    image: "/team/oghenebrorie.jpg",
    quote:
      "Passionate about documenting the journey and the human stories behind it.",
    socialLinks: {
      medium: "https://medium.com/@oghenetejiri",
      x: "https://x.com/oghenetejiri",
    },
    songObsession: "ONLY WHAT GOD CAN GIVE",
    favoriteBook: "Burn for Burn (Jenny Han)",
    favoriteColor: "White is peace, Black is intriguing, Pink is warmth.",
    howIUnwind: "Worship music and prayer",
  },
  {
    name: "Habeeb",
    role: "COMMUNITY MANAGER",
    course: "COMPUTER SCIENCE",
    image: "/team/habeeb.jpg",
    quote: "Ensuring the community stays vibrant, connected, and curious.",
    socialLinks: {
      x: "https://x.com/ycent003",
    },
    songObsession: "Can’t Fake this by 255",
    favoriteBook: "Art of Seduction",
    favoriteColor: "White (Peace)",
    howIUnwind: "Sleep",
  },
  {
    name: "Dosunmu Hafeez",
    role: "WRITER",
    course: "ACCOUNTING",
    image: "/team/dosunmu.jpg",
    quote: "A storyteller focusing on human experiences in a digital world.",
    socialLinks: {
      medium: "https://medium.com/@dosunmuhafeez",
    },
    songObsession: "Sacrifice by Mariah",
    favoriteBook: "Nearly All Men In Lagos... Mad",
    favoriteColor: "Blue (Peace & Control)",
    howIUnwind: "Sleep",
  },
  {
    name: "Freda",
    role: "WRITER",
    course: "INFORMATION TECH",
    image: "/team/frede.jpg",
    quote: "They make me feel special, unique, and full of wisdom and self-worth.",
    socialLinks: {
      x: "https://x.com/freda",
      instagram: "https://instagram.com/freda",
    },
    songObsession: "Davido’s songs",
    favoriteBook: "Comedic & Tech related",
    favoriteColor: "Black, White and Gold",
    howIUnwind: "Calm & Relaxation",
  },
  {
    name: "Tayo Adefila",
    role: "WRITER",
    course: "COMPUTER SCIENCE",
    image: "/team/toju.jpg",
    quote: "Finding beauty in everything, one line at a time.",
    socialLinks: {
      substack: "https://tayoadefila.substack.com",
    },
    songObsession: "So Easy by Olivia Dean",
    favoriteBook: "Pride and Prejudice",
    favoriteColor: "Every color (Beauty in all)",
    howIUnwind: "\"I do not\"",
  },
  {
    name: "Agunbiade Ayomide",
    role: "WRITER",
    course: "SOFTWARE ENGINEERING",
    image: "/team/agunbiade.jpg",
    quote: "Always wanted to be the golden power ranger. Impact is key.",
    socialLinks: {
      snapchat: "https://snapchat.com/add/agunbiade",
      x: "https://x.com/agunbiadeayomide",
    },
    songObsession: "May I Have This Dance",
    favoriteBook: "Darkest Minds",
    favoriteColor: "Gold",
    howIUnwind: "Music & Gaming",
  },
  {
    name: "Andrea Andy",
    role: "WRITER",
    course: "SOFTWARE ENGINEERING",
    image: "/team/andrea.jpg",
    quote: "Black is expressive. If daring, it's safe. It literally screams to me.",
    socialLinks: {
      instagram: "https://instagram.com/andreaandy",
      medium: "https://medium.com/@andreaandy",
    },
    songObsession: "1sa l0t by Zaylevelten",
    favoriteBook: "How to sell to Nigerians",
    favoriteColor: "Black",
    howIUnwind: "Music & TikTok",
  },
];

function MemberAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2);

  return (
    <div className="w-20 md:w-35 h-20 md:h-35 rounded-lg overflow-hidden shrink-0 bg-white/5 relative">
      <div className="w-full h-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center">
        <span className="text-2xl font-bold text-primary">{initials}</span>
      </div>
    </div>
  );
}

export default function TeamPage() {
  return (
    <main className="min-h-screen bg-[#0B0D0F]">
      <Header />

      <section className="py-20 px-4">
        <div className="container max-w-275 mx-auto">
          <div className="mb-16">
            <p className="text-[#9CA3AF] text-[10px] font-bold uppercase leading-3.75 tracking-[4px] mb-6 flex items-center justify-center gap-3 bg-[#FFFFFF0D] border border-[#FFFFFF1A] rounded-[9999px] w-[291.5px] h-9.25 text-center">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-hover opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
            </span>
              THE CREATIVE COLLECTIVE
            </p>
            <h1
              className="text-6xl md:text-9xl font-bold mb-8 leading-[108.8px] tracking-[-6.4px]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
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
              <p
                className="text-[#CBD5E1] text-base md:text-3xl leading-[48.75px] italic"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                "Behind every word, line of statement and piece, there's a voice
                — a person. This is us — unfiltered, human, and learning as we
                go."
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-20">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-[#16181D] rounded-2xl md:rounded-[48px] p-6 md:p-8 border border-[#FFFFFF0F]"
              >
                <div className="flex items-start gap-4 md:gap-6 mb-4">
                  <MemberAvatar name={member.name} />

                  <div className="flex-1">
                    <h3
                      className="text-lg md:text-3xl leading-9 tracking-[-0.75px] font-bold text-white mb-1"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {member.name}
                    </h3>
                    <p
                      className="text-primary text-[10px] md:text-sm leading-5 tracking-[1.4px] font-bold uppercase mb-2"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {member.role}
                    </p>
                    <p
                      className="text-[#94A3B8] text-[8px] md:text-[10px] leading-3.75 tracking-[1.4px] font-semibold uppercase mb-2"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {member.course}
                    </p>
                    {member.socialLinks && (
                      <div className="flex gap-2 flex-wrap font-bold text-[10px] leading-3.75 underline decoration-[#FFFFFF1A] decoration-0 underline-offset-4">
                        {member.socialLinks.medium && (
                          <a
                            href={member.socialLinks.medium}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#94A3B8] hover:text-primary transition-colors"
                          >
                            Medium
                          </a>
                        )}
                        {member.socialLinks.snapchat && (
                          <a
                            href={member.socialLinks.snapchat}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#94A3B8] hover:text-primary transition-colors"
                          >
                            Snapchat
                          </a>
                        )}
                        {member.socialLinks.substack && (
                          <a
                            href={member.socialLinks.substack}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#94A3B8] hover:text-primary transition-colors"
                          >
                            Substack
                          </a>
                        )}
                        {member.socialLinks.x && (
                          <a
                            href={member.socialLinks.x}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#94A3B8] hover:text-primary transition-colors"
                          >
                            X
                          </a>
                        )}
                        {member.socialLinks.instagram && (
                          <a
                            href={member.socialLinks.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#94A3B8] hover:text-primary transition-colors"
                          >
                            Instagram
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <p
                  className="text-[#CBD5E1] italic text-sm md:text-[18px] leading-7 mb-6 md:mb-8"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  "{member.quote}"
                </p>

                <hr className="mb-6 md:mb-8 text-[#FFFFFF0D]" />

                <div className="grid grid-cols-2 gap-4 md:gap-6 text-xs">
                  <div>
                    <p className="text-[#94A3B8] uppercase leading-[13.5px] tracking-[1.8PX] font-bold text-[9px] mb-1.5">
                      SONG OBSESSION
                    </p>
                    <p className="text-[#E2E8F0] font-medium text-[13px] leading-[19.5px]">{member.songObsession}</p>
                  </div>

                  <div>
                    <p className="text-[#94A3B8] uppercase leading-[13.5px] tracking-[1.8PX] font-bold text-[9px] mb-1.5">
                      FAVORITE BOOK
                    </p>
                    <p className="text-[#E2E8F0] font-medium text-[13px] leading-[19.5px]">{member.favoriteBook}</p>
                  </div>

                  <div>
                    <p className="text-[#94A3B8] uppercase leading-[13.5px] tracking-[1.8PX] font-bold text-[9px] mb-1.5">
                      FAVORITE COLOR
                    </p>
                    <p className="text-[#E2E8F0] font-medium text-[13px] leading-[19.5px]">{member.favoriteColor}</p>
                  </div>

                  <div>
                    <p className="text-[#94A3B8] uppercase leading-[13.5px] tracking-[1.8PX] font-bold text-[9px] mb-1.5">
                      HOW I MANAGE SCHOOL PRESSURE
                    </p>
                    <p className="text-[#E2E8F0] font-medium text-[13px] leading-[19.5px]">{member.howIUnwind}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
          <div className="bg-[#16181D] border border-[#FFFFFF0D] rounded-3xl mx-auto max-w-346 md:h-[967.78px] flex flex-col justify-center p-12 mb-12">
            <p
              className="text-[#94A3B8] text-lg md:text-[48px] leading-[48.75px] text-center max-w-265.75 mx-auto italic mb-12"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              "What stands out isn’t just what we study or what we build, but who we are while doing it. We manage pressure differently. We find meaning in different things. We recharge in our own ways. And yet, we come together as a community driven by curiosity, growth, and the desire to build something meaningful and we hope that you enjoy this RADAR issue as much as we do!."
            </p>

            <span className="flex justify-center my-3"><hr className="w-16 text-primary" /></span>

            <div className="text-center">
              <h2
                className="text-5xl md:text-[96px] leading-24 text-primary mb-2 -rotate-2"
                style={{
                  fontFamily: "cursive",
                  fontWeight: "400",
                  fontStyle: "italic",
                }}
              >
                Commit & Push
              </h2>
              <p className="text-[#6b7280] font-bold text-xs leading-4.5 uppercase tracking-[7.2px]">
                THE GDG CREATIVE WRITING TEAM
              </p>
            </div>
          </div>
      </section>

      <Footer />
    </main>
  );
}
