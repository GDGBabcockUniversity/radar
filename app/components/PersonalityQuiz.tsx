"use client";

import { useState } from "react";

interface Question {
  id: number;
  text: string;
  options: {
    letter: "A" | "B" | "C" | "D";
    text: string;
  }[];
}

const QUESTIONS: Question[] = [
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

interface QuizResult {
  title: string;
  emojis: string;
  description: string;
}

const RESULTS: Record<string, QuizResult> = {
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
  // Ties
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

export default function PersonalityQuiz({ quizId }: { quizId?: string }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);

  const isComplete = Object.keys(answers).length === QUESTIONS.length;

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
      .sort(); // Sort to ensure consistent key generation like "A,B"

    let finalResultKey = topLetters[0];

    if (topLetters.length === 4) {
      finalResultKey = "ALL";
    } else if (topLetters.length === 3) {
      finalResultKey = "THREE_WAY";
    } else if (topLetters.length === 2) {
      // Possible 2-way ties: A&B, B&D, A&C, C&D
      const tieKey = topLetters.join(",");
      if (RESULTS[tieKey]) {
        finalResultKey = tieKey;
      } else {
        // Fallback for unhandled 2-way ties (e.g. A&D, B&C - though not specified in rules, just in case)
        finalResultKey = "THREE_WAY"; // Use confused state as fallback
      }
    }

    setResult(RESULTS[finalResultKey]);

    // Custom pure DOM confetti since canvas-confetti package isn't available
    const colors = ["#ff0a54", "#ff477e", "#ff7096", "#ff85a1", "#fbb1bd"];
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
      const color = colors[Math.floor(Math.random() * colors.length)];
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

  // If it's not the valentine's quiz, show a placeholder
  if (quizId && quizId !== "valentines-2026") {
    return (
      <div className="my-10 p-8 bg-[#1a1a1a] border border-white/10 rounded-xl text-center">
        <span className="text-4xl mb-4 block">💝</span>
        <p className="text-white font-semibold mb-2">Personality Quiz</p>
        <p className="text-gray-400 text-sm">
          Quiz ID &quot;{quizId}&quot; not found.
        </p>
      </div>
    );
  }

  return (
    <div className="my-12 bg-black/40 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-linear-to-r from-pink-950 to-rose-950 p-6 sm:p-8 text-center border-b border-white/10">
        <h2
          className="text-2xl sm:text-3xl font-bold text-white mb-2"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          What&apos;s Your Valentine&apos;s Vibe? 💘
        </h2>
        <p className="text-pink-200/80 text-sm sm:text-base">
          Answer honestly. We won&apos;t judge. Much.
        </p>
      </div>

      <div className="p-6 sm:p-8">
        {!result ? (
          <div className="space-y-10">
            {QUESTIONS.map((q, index) => (
              <div key={q.id} className="scroll-mt-24" id={`q-${q.id}`}>
                <h3 className="text-lg font-semibold text-white mb-4 flex gap-3">
                  <span className="text-pink-500">{index + 1}.</span>
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
                            ? "bg-pink-500/10 border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.15)]"
                            : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                        }
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`
                          w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                          ${
                            answers[q.id] === opt.letter
                              ? "border-pink-500"
                              : "border-gray-500"
                          }
                        `}
                        >
                          {answers[q.id] === opt.letter && (
                            <div className="w-3 h-3 bg-pink-500 rounded-full" />
                          )}
                        </div>
                        <span
                          className={`text-sm sm:text-base ${answers[q.id] === opt.letter ? "text-white" : "text-gray-300"}`}
                        >
                          <span className="font-bold mr-2 text-gray-500">
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

            <div className="pt-6 border-t border-white/10 flex justify-center">
              <button
                onClick={calculateResult}
                disabled={!isComplete}
                className={`
                  px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300
                  ${
                    isComplete
                      ? "bg-linear-to-r from-pink-600 to-rose-600 text-white hover:shadow-[0_0_30px_rgba(225,29,72,0.4)] hover:-translate-y-1 cursor-pointer"
                      : "bg-white/10 text-gray-400 cursor-not-allowed"
                  }
                `}
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {isComplete
                  ? "Reveal My Vibe ✨"
                  : "Answer all questions to continue"}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 animate-in fade-in zoom-in duration-500">
            <div className="text-5xl sm:text-7xl mb-6">{result.emojis}</div>
            <p className="text-pink-400 font-medium uppercase tracking-widest text-sm mb-2">
              You are
            </p>
            <h3
              className="text-3xl sm:text-4xl font-bold text-white mb-6"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {result.title}
            </h3>
            <div className="bg-white/5 p-6 sm:p-8 rounded-2xl border border-white/10 max-w-2xl mx-auto mb-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-linear-to-b from-pink-500 to-rose-500" />
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                {result.description}
              </p>
            </div>

            <button
              onClick={resetQuiz}
              className="text-gray-400 hover:text-white underline underline-offset-4 transition-colors text-sm"
            >
              Retake Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
