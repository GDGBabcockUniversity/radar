"use client";

import { useState } from "react";
import { track } from "../lib/track";

interface Question {
  id: number;
  text: string;
  options: {
    letter: "A" | "B" | "C" | "D";
    text: string;
  }[];
}

interface QuizResult {
  title: string;
  emojis: string;
  description: string;
}

interface QuizTheme {
  headerGradient: string;
  accentClass: string;
  accentBgClass: string;
  accentBorderClass: string;
  accentGlowClass: string;
  buttonGradient: string;
  buttonGlow: string;
  confettiColors: string[];
  headerTitle: string;
  headerSubtitle: string;
  submitText: string;
  pendingText: string;
  resultLabel: string;
  resultAccentClass: string;
  resultBarGradient: string;
}

interface QuizConfig {
  questions: Question[];
  results: Record<string, QuizResult>;
  theme: QuizTheme;
}

// ─── Valentine's Quiz ───────────────────────────────────────────────

const VALENTINES_THEME: QuizTheme = {
  headerGradient: "bg-linear-to-r from-pink-950 to-rose-950",
  accentClass: "text-pink-500",
  accentBgClass: "bg-pink-500",
  accentBorderClass: "border-pink-500",
  accentGlowClass:
    "bg-pink-500/10 border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.15)]",
  buttonGradient:
    "bg-linear-to-r from-pink-600 to-rose-600 text-content hover:shadow-[0_0_30px_rgba(225,29,72,0.4)]",
  buttonGlow: "hover:shadow-[0_0_30px_rgba(225,29,72,0.4)]",
  confettiColors: ["#ff0a54", "#ff477e", "#ff7096", "#ff85a1", "#fbb1bd"],
  headerTitle: "What's Your Valentine's Vibe? 💘",
  headerSubtitle: "Answer honestly. We won't judge. Much.",
  submitText: "Reveal My Vibe ✨",
  pendingText: "Answer all questions to continue",
  resultLabel: "You are",
  resultAccentClass: "text-pink-400",
  resultBarGradient: "bg-linear-to-b from-pink-500 to-rose-500",
};

const VALENTINES_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "It's February 13th. What's your mood?",
    options: [
      { letter: "A", text: "Calm. Love is beautiful." },
      {
        letter: "B",
        text: "Stressed. Let me see what he/she is planning first.",
      },
      { letter: "C", text: "Indifferent. It's just another day." },
      { letter: "D", text: "Strategic. Who is buying me what?" },
    ],
  },
  {
    id: 2,
    text: "Someone posts a bouquet bigger than your future on their WhatsApp status. You:",
    options: [
      { letter: "A", text: "Smile and move on." },
      { letter: "B", text: "Zoom in to check the card." },
      { letter: "C", text: 'Post a "God when?" meme.' },
      {
        letter: "D",
        text: 'Screenshot and send to your friend: "This one na loan."',
      },
    ],
  },
  {
    id: 3,
    text: "Your situationship hasn't said anything about Valentine's. You:",
    options: [
      { letter: "A", text: "Communicate directly." },
      { letter: "B", text: "Drop subtle hints." },
      { letter: "C", text: "Pretend you don't care but overthink." },
      { letter: "D", text: "Start replying late." },
    ],
  },
  {
    id: 4,
    text: "Ideal Valentine's plan?",
    options: [
      { letter: "A", text: "Cute dinner + deep conversations." },
      { letter: "B", text: "Matching outfits + pictures." },
      { letter: "C", text: "Sleep. Eat shawarma. Watch Netflix." },
      { letter: "D", text: "Collect gift. Post gift. Glow." },
    ],
  },
  {
    id: 5,
    text: "Your love language is:",
    options: [
      { letter: "A", text: "Quality time" },
      { letter: "B", text: "Gifts" },
      { letter: "C", text: "Words of affirmation" },
      { letter: "D", text: "Peace and quiet" },
    ],
  },
  {
    id: 6,
    text: "Be honest. Have you ever said \"I don't celebrate Valentine's\" but still expected something?",
    options: [
      { letter: "A", text: "No" },
      { letter: "B", text: "Maybe once" },
      { letter: "C", text: "Yes 😭" },
      { letter: "D", text: "I plead the fifth" },
    ],
  },
  {
    id: 7,
    text: "If nobody does anything for you on Valentine's:",
    options: [
      { letter: "A", text: "I'll still be okay." },
      { letter: "B", text: "I'll feel small small pain." },
      { letter: "C", text: 'I\'ll post "Self love is the best love."' },
      { letter: "D", text: "I'll plan revenge for next year." },
    ],
  },
];

const VALENTINES_RESULTS: Record<string, QuizResult> = {
  A: {
    title: "The Soft Romantic",
    emojis: "💐🤍💌",
    description:
      "You genuinely love love. Effort melts you. A thoughtful text, a handwritten note, a quiet dinner? You're already smiling. Valentine's Day is not about noise — it's about intention.",
  },
  B: {
    title: "The Silent Expecter",
    emojis: "💅👀🌹",
    description:
      "You say \"I don't really care like that\"... but you're watching. You won't beg, but you will notice. If effort is missing, your energy will shift quietly.",
  },
  C: {
    title: "The Unbothered Realist",
    emojis: "🧘‍♀️😌✨",
    description:
      "It's just February 14th. You're calm. Whether single or taken, your peace is intact. Shawarma, sleep, or soft life — you're good either way.",
  },
  D: {
    title: "The Strategic Collector",
    emojis: "🎁💸🕶️",
    description:
      "You understand timing. You understand value. Love is sweet, but let's be serious — what are we exchanging here? If it's Valentine's, it must val.",
  },
  "A,B": {
    title: "Hopeless Lover in Denial",
    emojis: "💖🙈💭",
    description:
      "You love love... but you're pretending you're tougher than you are. You want effort, but you won't fully admit it. Emotional softie loading.",
  },
  "B,D": {
    title: "High-Expectation Romantic",
    emojis: "💅🎁✨",
    description:
      'Your standards are structured. If you\'re going to care, the effort must match. "Nonchalant" is not attractive to you.',
  },
  "A,C": {
    title: "Soft but Self-Sufficient Lover",
    emojis: "🌷🧘🤍",
    description:
      "You're gentle, but you're not desperate. You appreciate romance, but your happiness isn't hanging on it.",
  },
  "C,D": {
    title: "Detached Opportunist",
    emojis: "😌💸🕶️",
    description:
      "You're emotionally stable... but if benefits are involved, why not? You're not pressed — you're practical.",
  },
  THREE_WAY: {
    title: "Emotionally Confused but Vibing",
    emojis: "🤡💫🫠",
    description:
      "You don't even know what's going on anymore. Romantic? Detached? Strategic? Yes.",
  },
  ALL: {
    title: "Main Character Energy",
    emojis: "👑🎬✨",
    description:
      "You are unpredictable. You are layered. You are the storyline. Valentine's revolves around your mood.",
  },
};

// ─── Track Finder Quiz ──────────────────────────────────────────────

const TRACK_FINDER_THEME: QuizTheme = {
  headerGradient: "bg-linear-to-r from-indigo-950 to-violet-950",
  accentClass: "text-violet-500",
  accentBgClass: "bg-violet-500",
  accentBorderClass: "border-violet-500",
  accentGlowClass:
    "bg-violet-500/10 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.15)]",
  buttonGradient:
    "bg-linear-to-r from-indigo-600 to-violet-600 text-content hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]",
  buttonGlow: "hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]",
  confettiColors: ["#818cf8", "#6366f1", "#a78bfa", "#8b5cf6", "#c4b5fd"],
  headerTitle: "Find Your Tech Track 🧭",
  headerSubtitle: "9 questions. One path. No wrong answers.",
  submitText: "Reveal My Track 🚀",
  pendingText: "Answer all questions to continue",
  resultLabel: "Your track is",
  resultAccentClass: "text-violet-400",
  resultBarGradient: "bg-linear-to-b from-indigo-500 to-violet-500",
};

const TRACK_FINDER_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Which of these interests you the most?",
    options: [
      { letter: "A", text: "Finding patterns in data" },
      { letter: "B", text: "Building apps or websites" },
      { letter: "C", text: "Understanding how systems work" },
      { letter: "D", text: "Designing how things look and feel" },
    ],
  },
  {
    id: 2,
    text: "When you see a problem, you think:",
    options: [
      { letter: "A", text: "What data explains this?" },
      { letter: "B", text: "How can I build a solution?" },
      { letter: "C", text: "How does this system work?" },
      { letter: "D", text: "How can this be better for users?" },
    ],
  },
  {
    id: 3,
    text: "Which activity sounds most fun?",
    options: [
      { letter: "A", text: "Analyzing trends" },
      { letter: "B", text: "Coding a feature" },
      { letter: "C", text: "Setting up or testing systems" },
      { letter: "D", text: "Designing an interface" },
    ],
  },
  {
    id: 4,
    text: "People describe you as:",
    options: [
      { letter: "A", text: "Analytical" },
      { letter: "B", text: "Logical" },
      { letter: "C", text: "Curious" },
      { letter: "D", text: "Creative" },
    ],
  },
  {
    id: 5,
    text: "Your group project is due tomorrow, you:",
    options: [
      { letter: "A", text: "Handle the data and insights" },
      { letter: "B", text: "Build the main solution" },
      { letter: "C", text: "Make sure everything works properly" },
      { letter: "D", text: "Make the presentation clean and attractive" },
    ],
  },
  {
    id: 6,
    text: "You see a badly designed website:",
    options: [
      { letter: "A", text: "You don't really mind" },
      { letter: "B", text: "As long as it works, it's fine" },
      { letter: "C", text: "You wonder how it's built or hosted" },
      { letter: "D", text: "Who designed this abeg 😭" },
    ],
  },
  {
    id: 7,
    text: "Which tool would you rather learn?",
    options: [
      { letter: "A", text: "Excel or Python" },
      { letter: "B", text: "JavaScript or React" },
      { letter: "C", text: "Linux or Networking tools" },
      { letter: "D", text: "Figma" },
    ],
  },
  {
    id: 8,
    text: "What gives you the most satisfaction?",
    options: [
      { letter: "A", text: "Discovering insights" },
      { letter: "B", text: "Building something functional" },
      { letter: "C", text: "Making a system stable or secure" },
      { letter: "D", text: "Creating something visually appealing" },
    ],
  },
  {
    id: 9,
    text: "Finally, pick one:",
    options: [
      { letter: "A", text: "Data" },
      { letter: "B", text: "Code" },
      { letter: "C", text: "Systems" },
      { letter: "D", text: "Design" },
    ],
  },
];

const TRACK_FINDER_RESULTS: Record<string, QuizResult> = {
  A: {
    title: "Data & AI",
    emojis: "📊🤖🔍",
    description:
      "You see what others miss. Numbers speak to you, patterns excite you, and insights are your superpower. Whether it's machine learning models or data pipelines, you're built for turning raw information into real impact.",
  },
  B: {
    title: "Software Development & Engineering",
    emojis: "💻🚀⚡",
    description:
      "You're a builder at heart. If there's a problem, you want to code the solution. From frontend interfaces to backend logic, you thrive when you're shipping features and watching your ideas come to life.",
  },
  C: {
    title: "Infrastructure & Security",
    emojis: "🔧🛡️⚙️",
    description:
      "You're the one asking \"but how does it actually work?\" You care about what's under the hood — networks, servers, cloud, and security. If it runs, scales, or needs protecting, that's your domain.",
  },
  D: {
    title: "Design & Management",
    emojis: "🎨✨📐",
    description:
      "You have an eye for what feels right. Bad UX bothers you, ugly interfaces keep you up at night, and you believe tech should look as good as it works. You're the bridge between ideas and experiences.",
  },
  "A,B": {
    title: "Data-Driven Developer",
    emojis: "📊💻🔬",
    description:
      "You don't just build — you build with evidence. You love both writing code and mining data for insights. Think full-stack data engineer or ML-powered applications.",
  },
  "A,C": {
    title: "Data Infrastructure Specialist",
    emojis: "📊🔧🗄️",
    description:
      "You're fascinated by both data and the systems that power it. Data pipelines, cloud architecture, and scalable analytics platforms? That's your sweet spot.",
  },
  "A,D": {
    title: "Data Visualization Specialist",
    emojis: "📊🎨📈",
    description:
      "You turn numbers into stories people can see. You combine analytical thinking with a keen design eye — dashboards, infographics, and visual insights are your thing.",
  },
  "B,C": {
    title: "DevOps Engineer",
    emojis: "💻⚙️🔄",
    description:
      "You love building AND making sure it runs. Code meets infrastructure in your world — CI/CD pipelines, containerization, and seamless deployments excite you.",
  },
  "B,D": {
    title: "Product Engineer",
    emojis: "💻🎨🚀",
    description:
      "You build things that look and work beautifully. You care about the code AND the experience. Frontend engineering with a design sensibility — that's your lane.",
  },
  "C,D": {
    title: "UX-Focused Systems Thinker",
    emojis: "🛡️🎨🧩",
    description:
      "An unusual but powerful combo. You care about how systems work AND how people interact with them. Think design systems, accessible architecture, or security UX.",
  },
  THREE_WAY: {
    title: "Tech Polymath",
    emojis: "🧠💡🌐",
    description:
      "You can't be boxed in. Data, code, systems, design — you're curious about it all. Your versatility is your strength. Explore broadly, then go deep where it clicks.",
  },
  ALL: {
    title: "Renaissance Technologist",
    emojis: "👑🔮✨",
    description:
      "Every track speaks to you equally. You're the rare one who sees the big picture — how data, code, infrastructure, and design all connect. You might just end up leading the whole thing.",
  },
};

// ─── Quiz Registry ──────────────────────────────────────────────────

const QUIZ_REGISTRY: Record<string, QuizConfig> = {
  "valentines-2026": {
    questions: VALENTINES_QUESTIONS,
    results: VALENTINES_RESULTS,
    theme: VALENTINES_THEME,
  },
  "track-finder-2026": {
    questions: TRACK_FINDER_QUESTIONS,
    results: TRACK_FINDER_RESULTS,
    theme: TRACK_FINDER_THEME,
  },
};

// ─── Component ──────────────────────────────────────────────────────

export default function PersonalityQuiz({ quizId }: { quizId?: string }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);

  const config = quizId
    ? QUIZ_REGISTRY[quizId]
    : QUIZ_REGISTRY["valentines-2026"];

  // If no matching quiz found, show fallback
  if (!config) {
    return (
      <div className="my-10 p-8 bg-surface-card border border-edge rounded-xl text-center">
        <span className="text-4xl mb-4 block">🧩</span>
        <p className="text-content font-semibold mb-2">Personality Quiz</p>
        <p className="text-content-muted text-sm">
          Quiz ID &quot;{quizId}&quot; not found.
        </p>
      </div>
    );
  }

  const { questions, results, theme } = config;
  const isComplete = Object.keys(answers).length === questions.length;

  const handleSelect = (questionId: number, letter: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: letter }));
  };

  const calculateResult = () => {
    // Count frequencies
    const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
    Object.values(answers).forEach((letter) => {
      counts[letter] += 1;
    });

    // Find the max count
    const maxCount = Math.max(...Object.values(counts));

    // Find all letters that have the max count
    const topLetters = Object.keys(counts)
      .filter((letter) => counts[letter] === maxCount)
      .sort();

    let finalResultKey = topLetters[0];

    if (topLetters.length === 4) {
      finalResultKey = "ALL";
    } else if (topLetters.length === 3) {
      finalResultKey = "THREE_WAY";
    } else if (topLetters.length === 2) {
      const tieKey = topLetters.join(",");
      if (results[tieKey]) {
        finalResultKey = tieKey;
      } else {
        finalResultKey = "THREE_WAY";
      }
    }

    setResult(results[finalResultKey]);
    // No right/wrong answers here, so "score" is how decisively the
    // answers leaned toward one trait — the dominant letter's share of
    // all responses, as a 0-100 strength.
    const score = Math.round((maxCount / questions.length) * 100);
    track("game.played", {
      gameId: `quiz:${quizId ?? "unknown"}`,
      resultKey: finalResultKey,
      score,
    });

    // Custom pure DOM confetti
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = "100vw";
    container.style.height = "100vh";
    container.style.pointerEvents = "none";
    container.style.zIndex = "9999";
    document.body.appendChild(container);

    for (let i = 0; i < 100; i++) {
      const particle = document.createElement("div");
      const color =
        theme.confettiColors[
          Math.floor(Math.random() * theme.confettiColors.length)
        ];
      const left = Math.random() * 100;
      const animDuration = Math.random() * 3 + 2;
      const delay = Math.random() * 0.5;

      particle.style.position = "absolute";
      particle.style.top = "-10px";
      particle.style.left = `${left}vw`;
      particle.style.width = "10px";
      particle.style.height = "10px";
      particle.style.backgroundColor = color;
      particle.style.borderRadius = Math.random() > 0.5 ? "50%" : "0";
      particle.style.opacity = "1";
      particle.style.transform = `rotate(${Math.random() * 360}deg)`;
      particle.style.animation = `fall ${animDuration}s linear ${delay}s forwards`;

      container.appendChild(particle);
    }

    // Add keyframes if not exists
    if (!document.getElementById("confetti-styles")) {
      const style = document.createElement("style");
      style.id = "confetti-styles";
      style.innerHTML = `
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    setTimeout(() => {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    }, 5000);
  };

  const resetQuiz = () => {
    setAnswers({});
    setResult(null);
  };

  const exportAsImage = async () => {
    if (!result) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = 1080;
    const h = 1080;
    canvas.width = w;
    canvas.height = h;

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, "#0a0a0a");
    bgGrad.addColorStop(1, "#1a1a2e");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Accent gradient bar at the top
    const accentColor = theme.confettiColors[0] || "#ff0a54";
    const accentColor2 = theme.confettiColors[2] || "#ff7096";
    const topBar = ctx.createLinearGradient(0, 0, w, 0);
    topBar.addColorStop(0, accentColor);
    topBar.addColorStop(1, accentColor2);
    ctx.fillStyle = topBar;
    ctx.fillRect(0, 0, w, 6);

    // Subtle border
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 40, w - 80, h - 80);

    // Emojis
    ctx.font = "80px serif";
    ctx.textAlign = "center";
    ctx.fillText(result.emojis, w / 2, 200);

    // "You are" / result label
    ctx.font = "600 16px 'Inter', sans-serif";
    ctx.fillStyle = accentColor;
    ctx.letterSpacing = "4px";
    ctx.fillText(theme.resultLabel.toUpperCase(), w / 2, 280);
    ctx.letterSpacing = "0px";

    // Title
    ctx.font = "bold 48px 'Inter', sans-serif";
    ctx.fillStyle = "#ffffff";
    const titleLines = wrapText(ctx, result.title, w - 160);
    let titleY = 340;
    for (const line of titleLines) {
      ctx.fillText(line, w / 2, titleY);
      titleY += 58;
    }

    // Description card background
    const descTop = titleY + 20;
    const descPadding = 40;
    const descMaxWidth = w - 160;

    ctx.font = "400 22px 'Inter', sans-serif";
    const descLines = wrapText(
      ctx,
      result.description,
      descMaxWidth - descPadding * 2,
    );
    const descBlockHeight = descLines.length * 34 + descPadding * 2;

    // Card bg
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    roundedRect(ctx, 80, descTop, w - 160, descBlockHeight, 20);
    ctx.fill();

    // Card border
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    roundedRect(ctx, 80, descTop, w - 160, descBlockHeight, 20);
    ctx.stroke();

    // Accent bar on card
    const barGrad = ctx.createLinearGradient(
      0,
      descTop,
      0,
      descTop + descBlockHeight,
    );
    barGrad.addColorStop(0, accentColor);
    barGrad.addColorStop(1, accentColor2);
    ctx.fillStyle = barGrad;
    roundedRect(ctx, 80, descTop, 4, descBlockHeight, 2);
    ctx.fill();

    // Description text
    ctx.font = "400 22px 'Inter', sans-serif";
    ctx.fillStyle = "#d1d5db";
    ctx.textAlign = "center";
    let descY = descTop + descPadding + 22;
    for (const line of descLines) {
      ctx.fillText(line, w / 2, descY);
      descY += 34;
    }

    // Branding footer
    ctx.font = "600 18px 'Inter', sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.textAlign = "center";
    ctx.fillText("RADAR", w / 2, h - 60);

    // Download
    const link = document.createElement("a");
    link.download = `${(result.title || "quiz-result").replace(/\s+/g, "-").toLowerCase()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="my-12 bg-surface-card border border-edge rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div
        className={`${theme.headerGradient} p-6 sm:p-8 text-center border-b border-edge`}
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-content mb-2">
          {theme.headerTitle}
        </h2>
        <p className="text-content-secondary text-sm sm:text-base">
          {theme.headerSubtitle}
        </p>
      </div>

      <div className="p-6 sm:p-8">
        {!result ? (
          <div className="space-y-10">
            {questions.map((q, index) => (
              <div key={q.id} className="scroll-mt-24" id={`q-${q.id}`}>
                <h3 className="text-lg font-semibold text-content mb-4 flex gap-3">
                  <span className={theme.accentClass}>{index + 1}.</span>
                  <span>{q.text}</span>
                </h3>
                <div className="space-y-3">
                  {q.options.map((opt) => (
                    <label
                      key={opt.letter}
                      className={`
                        block p-4 rounded-xl border cursor-pointer transition-all duration-200
                        ${
                          answers[q.id] === opt.letter
                            ? theme.accentGlowClass
                            : "bg-overlay border-edge hover:bg-overlay-strong hover:border-edge-strong"
                        }
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`
                          w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                          ${
                            answers[q.id] === opt.letter
                              ? theme.accentBorderClass
                              : "border-gray-500"
                          }
                        `}
                        >
                          {answers[q.id] === opt.letter && (
                            <div
                              className={`w-3 h-3 ${theme.accentBgClass} rounded-full`}
                            />
                          )}
                        </div>
                        <span
                          className={`text-sm sm:text-base ${answers[q.id] === opt.letter ? "text-content" : "text-content-secondary"}`}
                        >
                          <span className="font-bold mr-2 text-content-subtle">
                            {opt.letter}.
                          </span>
                          {opt.text}
                        </span>
                      </div>
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        value={opt.letter}
                        checked={answers[q.id] === opt.letter}
                        onChange={() => handleSelect(q.id, opt.letter)}
                        className="sr-only"
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-6 border-t border-edge flex justify-center">
              <button
                onClick={calculateResult}
                disabled={!isComplete}
                className={`
                  px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300
                  ${
                    isComplete
                      ? `${theme.buttonGradient} hover:-translate-y-1 cursor-pointer`
                      : "bg-overlay-strong text-content-muted cursor-not-allowed"
                  }
                `}
              >
                {isComplete ? theme.submitText : theme.pendingText}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 animate-in fade-in zoom-in duration-500">
            <div className="text-5xl sm:text-7xl mb-6">{result.emojis}</div>
            <p
              className={`${theme.resultAccentClass} font-medium uppercase tracking-widest text-sm mb-2`}
            >
              {theme.resultLabel}
            </p>
            <h3 className="text-3xl sm:text-4xl font-bold text-content mb-6">
              {result.title}
            </h3>
            <div className="bg-overlay p-6 sm:p-8 rounded-2xl border border-edge max-w-2xl mx-auto mb-8 relative overflow-hidden">
              <div
                className={`absolute top-0 left-0 w-1 h-full ${theme.resultBarGradient}`}
              />
              <p className="text-content-secondary text-base sm:text-lg leading-relaxed">
                {result.description}
              </p>
            </div>

            <div className="flex items-center justify-center gap-6">
              <button
                onClick={exportAsImage}
                className={`${theme.buttonGradient} px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5 cursor-pointer flex items-center gap-2`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Save as Image
              </button>
              <button
                onClick={resetQuiz}
                className="text-content-muted hover:text-content underline underline-offset-4 transition-colors text-sm"
              >
                Retake Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Canvas Helpers ───────────────────────────────────────────────────

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
