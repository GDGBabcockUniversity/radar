// Clue bank for Cryptic, RADAR's daily cryptic-clue game. One clue per local
// day, rotating through the bank via dayIndex() — same scheme as Signal's
// answers. Every clue is an honest cryptic construction: a definition plus
// wordplay (anagram, hidden word, charade, container, double definition,
// homophone, reversal or palindrome), with the letter count in parens. The
// explanation names the device and walks through it — the post-solve reveal
// is the point of the game.

export interface CrypticClue {
  clue: string;
  answer: string; // uppercase A–Z only, 4–8 letters
  explanation: string;
  // Credited name for community-submitted clues. Existing clues leave this
  // unset and read as "the RADAR desk".
  author?: string;
}

export const CRYPTIC_CLUES: CrypticClue[] = [
  {
    clue: "Phony T rewritten as a programming language (6)",
    answer: "PYTHON",
    explanation:
      "Anagram: \"rewritten\" tells you to shuffle the letters of PHONY T, which rearrange into PYTHON — the programming language.",
  },
  {
    clue: "Language brewed in a coffee cup (4)",
    answer: "JAVA",
    explanation:
      "Double definition: JAVA is both a programming language and a slang word for coffee — the clue defines it twice.",
  },
  {
    clue: "Money for quick access, by the sound of it (5)",
    answer: "CACHE",
    explanation:
      "Homophone: \"by the sound of it\" signals that CACHE sounds exactly like CASH (money); the definition is \"for quick access\".",
  },
  {
    clue: "Ordered collection hidden in a solar raygun (5)",
    answer: "ARRAY",
    explanation:
      "Hidden word: \"hidden in\" points inside the phrase — sol-AR-RAY-gun conceals ARRAY, the ordered collection.",
  },
  {
    clue: "Remove the insect to fix the program (5)",
    answer: "DEBUG",
    explanation:
      "Charade: DE- (remove) + BUG (insect) builds DEBUG — what you do to fix a program.",
  },
  {
    clue: "One circuit, then a spinning toy — computer to go (6)",
    answer: "LAPTOP",
    explanation:
      "Charade: LAP (one circuit of a track) + TOP (a spinning toy) = LAPTOP, the portable computer.",
  },
  {
    clue: "Small river you can watch live (6)",
    answer: "STREAM",
    explanation:
      "Double definition: a STREAM is a small river, and to STREAM is to broadcast live.",
  },
  {
    clue: "Brainy, scrambled into ones and zeros (6)",
    answer: "BINARY",
    explanation:
      "Anagram: \"scrambled\" rearranges BRAINY into BINARY — the ones-and-zeros number system.",
  },
  {
    clue: "Could be rearranged where your files float (5)",
    answer: "CLOUD",
    explanation:
      "Anagram: \"rearranged\" shuffles COULD into CLOUD — where your files live off-device.",
  },
  {
    clue: "Waiter that hosts websites (6)",
    answer: "SERVER",
    explanation:
      "Double definition: a SERVER waits tables in a restaurant and also hosts websites in a rack.",
  },
  {
    clue: "Sweet treat your browser never forgets (6)",
    answer: "COOKIE",
    explanation:
      "Double definition: a COOKIE is a baked treat and the little file a website leaves in your browser.",
  },
  {
    clue: "Scamp and university stirred into school grounds (6)",
    answer: "CAMPUS",
    explanation:
      "Anagram: \"stirred\" mixes SCAMP + U (the standard abbreviation for university) into CAMPUS.",
  },
  {
    clue: "Dismiss, then hit a barrier — network protection (8)",
    answer: "FIREWALL",
    explanation:
      "Charade: FIRE (to dismiss someone) + WALL (a barrier) = FIREWALL, which protects a network.",
  },
  {
    clue: "Rodent resting in your palm at the desk (5)",
    answer: "MOUSE",
    explanation:
      "Double definition: a MOUSE is a rodent and the pointing device under your palm.",
  },
  {
    clue: "Junk mail? Maps sent back (4)",
    answer: "SPAM",
    explanation:
      "Reversal: \"sent back\" reverses MAPS into SPAM — junk mail.",
  },
  {
    clue: "Grazing animal reading the web (7)",
    answer: "BROWSER",
    explanation:
      "Double definition: a BROWSER is an animal that grazes on leaves, and the app you read the web with.",
  },
  {
    clue: "Military officer heard at the heart of the OS (6)",
    answer: "KERNEL",
    explanation:
      "Homophone: \"heard\" signals sound-alike — KERNEL sounds like COLONEL, the military officer; the definition is \"heart of the OS\".",
  },
  {
    clue: "Dial-up relic buried in custom ode memes (5)",
    answer: "MODEM",
    explanation:
      "Hidden word: \"buried in\" points inside the phrase — custo-M ODE M-emes conceals MODEM, the dial-up box.",
  },
  {
    clue: "Woodworking tool directing your traffic (6)",
    answer: "ROUTER",
    explanation:
      "Double definition: a ROUTER carves wood in a workshop and routes packets on your network.",
  },
  {
    clue: "Photos in brief catch the elevated train — smallest dot on screen (5)",
    answer: "PIXEL",
    explanation:
      "Charade: PIX (photos, in brief) + EL (the elevated train) = PIXEL, the smallest dot on a screen.",
  },
  {
    clue: "A levy on vice, we hear — grammar for machines (6)",
    answer: "SYNTAX",
    explanation:
      "Homophone: \"we hear\" signals sound-alike — SYNTAX sounds like SIN TAX, a levy on vice; the definition is \"grammar for machines\".",
  },
  {
    clue: "Small gesture of thanks your login carries everywhere (5)",
    answer: "TOKEN",
    explanation:
      "Double definition: a TOKEN is a small gesture of appreciation and the credential your login sends with every request.",
  },
  {
    clue: "Pile of pancakes where your function calls live (5)",
    answer: "STACK",
    explanation:
      "Double definition: a STACK is a pile (of pancakes, plates...) and the memory structure holding your function calls.",
  },
  {
    clue: "Waiting line that sounds like a single letter (5)",
    answer: "QUEUE",
    explanation:
      "Homophone: QUEUE — the waiting line — is pronounced exactly like the letter Q.",
  },
  {
    clue: "Runs through the needle and through your program (6)",
    answer: "THREAD",
    explanation:
      "Double definition: a THREAD passes through a needle, and a THREAD is a unit of execution running through your program.",
  },
  {
    clue: "Polisher holding your data until it moves on (6)",
    answer: "BUFFER",
    explanation:
      "Double definition: a BUFFER polishes surfaces, and a BUFFER temporarily holds data in transit.",
  },
  {
    clue: "Absolutely nothing — or a secret code (6)",
    answer: "CIPHER",
    explanation:
      "Double definition: CIPHER is an old word for zero (nothing) and also means a secret code.",
  },
  {
    clue: "Throw a party with the principal to claim web territory (6)",
    answer: "DOMAIN",
    explanation:
      "Charade: DO (a party, as in \"a big do\") + MAIN (principal) = DOMAIN, your territory on the web.",
  },
  {
    clue: "Test tucked into flex a muscle (4)",
    answer: "EXAM",
    explanation:
      "Hidden word: \"tucked into\" points inside the phrase — fl-EX A M-uscle conceals EXAM, the test.",
  },
  {
    clue: "Host boards the elevated train to campus lodging (6)",
    answer: "HOSTEL",
    explanation:
      "Charade: HOST + EL (the elevated train) = HOSTEL, lodging on or near campus.",
  },
  {
    clue: "Malware Ravi rushed to conceal (5)",
    answer: "VIRUS",
    explanation:
      "Hidden word: \"to conceal\" points inside the phrase — Ra-VI RUS-hed hides VIRUS, the malware.",
  },
  {
    clue: "Free OS sheltering among Berlin UX designers (5)",
    answer: "LINUX",
    explanation:
      "Hidden word: \"sheltering among\" points inside the phrase — Ber-LIN UX conceals LINUX, the free operating system.",
  },
  {
    clue: "Credo shaken up by a programmer (5)",
    answer: "CODER",
    explanation:
      "Anagram: \"shaken up\" rearranges CREDO into CODER — a programmer.",
  },
  {
    clue: "Facts surface when you add a table (4)",
    answer: "DATA",
    explanation:
      "Hidden word: the facts are sitting inside the phrase — ad-D A TA-ble conceals DATA.",
  },
  {
    clue: "Timber delivered at home gets you into the system (5)",
    answer: "LOGIN",
    explanation:
      "Charade: LOG (timber) + IN (at home) = LOGIN, what gets you into the system.",
  },
  {
    clue: "A cream, whipped, for the photographer's kit (6)",
    answer: "CAMERA",
    explanation:
      "Anagram: \"whipped\" mixes A CREAM into CAMERA — the photographer's essential kit.",
  },
  {
    clue: "Aligns differently for RADAR's daily word game (6)",
    answer: "SIGNAL",
    explanation:
      "Anagram: \"differently\" rearranges ALIGNS into SIGNAL — yes, the daily word game on this very site.",
  },
  {
    clue: "Detector reading the same in both directions (5)",
    answer: "RADAR",
    explanation:
      "Palindrome: RADAR — the detector — spells the same forwards and backwards, which is what \"reading the same in both directions\" signals.",
  },
  {
    clue: "Something essential about the directors under your fingers (8)",
    answer: "KEYBOARD",
    explanation:
      "Charade: KEY (essential) + BOARD (the directors of a company) = KEYBOARD — what sits under your fingers.",
  },
  {
    clue: "School supervisor you stare at all day (7)",
    answer: "MONITOR",
    explanation:
      "Double definition: a MONITOR is a school supervisor and the display you stare at all day.",
  },
  // ——— Batch two: heavier devices (containers, deletions, nested reversals,
  // initial/final letters, compound anagrams). Skews harder on purpose.
  {
    clue: "Tramline rebuilt — the end of the line for your commands (8)",
    answer: "TERMINAL",
    explanation:
      "Anagram: \"rebuilt\" rearranges TRAMLINE into TERMINAL — both the end of a line and where your commands go.",
  },
  {
    clue: "Complier converted into a code translator (8)",
    answer: "COMPILER",
    explanation:
      "Anagram: \"converted\" rearranges COMPLIER into COMPILER — the program that translates your code.",
  },
  {
    clue: "Gateman sent back with your conference ID (7)",
    answer: "NAMETAG",
    explanation:
      "Reversal: \"sent back\" reverses GATEMAN into NAMETAG — the ID you wear at a conference.",
  },
  {
    clue: "Pots upturned over a gap — a temporary fix (7)",
    answer: "STOPGAP",
    explanation:
      "Reversal in a charade: POTS \"upturned\" becomes STOP, then + GAP = STOPGAP, a temporary fix.",
  },
  {
    clue: "One caught up in a scheme flies the plane (5)",
    answer: "PILOT",
    explanation:
      "Container: I (one) is \"caught up in\" PLOT (a scheme) — P-I-LOT — giving PILOT, who flies the plane.",
  },
  {
    clue: "Bin holds the Egyptian sun god — it does your thinking (5)",
    answer: "BRAIN",
    explanation:
      "Container: BIN \"holds\" RA (the Egyptian sun god) — B-RA-IN — giving BRAIN, the thinking organ.",
  },
  {
    clue: "Chat about ecstasy? That's dishonest (5)",
    answer: "CHEAT",
    explanation:
      "Container: CHAT placed \"about\" E (the standard abbreviation for ecstasy) — CH-E-AT — gives CHEAT, dishonest play.",
  },
  {
    clue: "Learner boards a boat as the software swells (5)",
    answer: "BLOAT",
    explanation:
      "Container: L (learner, as on a driving plate) \"boards\" BOAT — B-L-OAT — giving BLOAT, what swollen software does.",
  },
  {
    clue: "Programmer drops his last — what's left is what he writes (4)",
    answer: "CODE",
    explanation:
      "Deletion: CODER (programmer) \"drops his last\" letter, leaving CODE — what he writes.",
  },
  {
    clue: "Planet cut short still flies (5)",
    answer: "PLANE",
    explanation:
      "Deletion: PLANET \"cut short\" loses its final letter, leaving PLANE — which flies.",
  },
  {
    clue: "Unfinished brandy marks your identity (5)",
    answer: "BRAND",
    explanation:
      "Deletion: BRANDY left \"unfinished\" loses its last letter, giving BRAND — an identity mark.",
  },
  {
    clue: "Router loses its head — it's external (5)",
    answer: "OUTER",
    explanation:
      "Deletion: ROUTER \"loses its head\" (first letter), leaving OUTER — external.",
  },
  {
    clue: "Endlessly classy set of students (5)",
    answer: "CLASS",
    explanation:
      "Deletion: CLASSY \"endlessly\" (without its end letter) gives CLASS — a set of students.",
  },
  {
    clue: "Japan awaits promising arrivals, initially — the great escape (4)",
    answer: "JAPA",
    explanation:
      "Initial letters: \"initially\" takes the first letters of Japan Awaits Promising Arrivals — JAPA, the slang for relocating abroad.",
  },
  {
    clue: "Gossip in student town, at the start — the full story (4)",
    answer: "GIST",
    explanation:
      "Initial letters: \"at the start\" takes the first letters of Gossip In Student Town — GIST, the full story.",
  },
  {
    clue: "Savings accounts permanently absent, at first — broke season (4)",
    answer: "SAPA",
    explanation:
      "Initial letters: \"at first\" takes the first letters of Savings Accounts Permanently Absent — SAPA, the season of being broke.",
  },
  {
    clue: "Ends of grand place calm solo — a product preview (4)",
    answer: "DEMO",
    explanation:
      "Final letters: \"ends of\" takes the last letters of granD placE calM solO — DEMO, a product preview.",
  },
  {
    clue: "Brief fault served in smug litchi pudding (6)",
    answer: "GLITCH",
    explanation:
      "Hidden word: \"served in\" points inside the phrase — smu-G LITCH-i conceals GLITCH, a brief fault.",
  },
  {
    clue: "Cash stashed inside a banana, irate vendor says (5)",
    answer: "NAIRA",
    explanation:
      "Hidden word: \"stashed inside\" points into the phrase — bana-NA IRA-te conceals NAIRA, the cash in question.",
  },
  {
    clue: "Bike taxi flagged down as you book a date (5)",
    answer: "OKADA",
    explanation:
      "Hidden word: the bike taxi is sitting inside the phrase — bo-OK A DA-te conceals OKADA.",
  },
  {
    clue: "Fresher's number buried in cinema tricks (6)",
    answer: "MATRIC",
    explanation:
      "Hidden word: \"buried in\" points inside the phrase — cine-MA TRIC-ks conceals MATRIC, the number every fresher gets.",
  },
  {
    clue: "Your online face peeking out of Java tariffs (6)",
    answer: "AVATAR",
    explanation:
      "Hidden word: \"peeking out of\" points inside the phrase — J-AVA TAR-iffs conceals AVATAR, your online face.",
  },
  {
    clue: "Web diary planted in herb logic (4)",
    answer: "BLOG",
    explanation:
      "Hidden word: \"planted in\" points inside the phrase — her-B LOG-ic conceals BLOG, the web diary.",
  },
  {
    clue: "Goals scattered across the city of hustle (5)",
    answer: "LAGOS",
    explanation:
      "Anagram: \"scattered\" rearranges GOALS into LAGOS — the city of hustle.",
  },
  {
    clue: "Hawala deal gone wrong — pure trouble (6)",
    answer: "WAHALA",
    explanation:
      "Anagram: \"gone wrong\" rearranges HAWALA (the informal money-transfer system) into WAHALA — trouble.",
  },
  {
    clue: "Fonda touring Lagos in a yellow bus (5)",
    answer: "DANFO",
    explanation:
      "Anagram: \"touring\" rearranges FONDA into DANFO — the yellow Lagos bus.",
  },
  {
    clue: "Rustle the papers for your exam outcome (6)",
    answer: "RESULT",
    explanation:
      "Anagram: \"rustle\" is both the fodder and the story — RUSTLE rearranges into RESULT, your exam outcome.",
  },
  {
    clue: "Top shot repositioned where the Wi-Fi flows (7)",
    answer: "HOTSPOT",
    explanation:
      "Anagram: \"repositioned\" rearranges TOP SHOT into HOTSPOT — where the Wi-Fi flows.",
  },
  {
    clue: "Botch at rewiring an artificial conversationalist (7)",
    answer: "CHATBOT",
    explanation:
      "Compound anagram: \"rewiring\" mixes BOTCH + AT into CHATBOT — the artificial conversationalist.",
  },
  {
    clue: "Loops wound back to feed the printer (5)",
    answer: "SPOOL",
    explanation:
      "Reversal: \"wound back\" reverses LOOPS into SPOOL — the print queue that feeds the printer.",
  },
  {
    clue: "Send money abroad, then send it back for the countdown (5)",
    answer: "TIMER",
    explanation:
      "Reversal: REMIT (send money abroad) \"sent back\" reads TIMER — the countdown device.",
  },
  {
    clue: "Diaper recycled, debt settled (6)",
    answer: "REPAID",
    explanation:
      "Reversal: \"recycled\" turns DIAPER around into REPAID — a debt settled.",
  },
  {
    clue: "Confronted, then turned away — a weaker brew (5)",
    answer: "DECAF",
    explanation:
      "Reversal: FACED (confronted) \"turned away\" reads DECAF — the weaker brew.",
  },
  {
    clue: "Angling for credentials, by the sound of it (8)",
    answer: "PHISHING",
    explanation:
      "Homophone: \"by the sound of it\" — PHISHING sounds exactly like FISHING (angling); the definition is angling for credentials.",
  },
  {
    clue: "Sounds sugary — a set of matching apps (5)",
    answer: "SUITE",
    explanation:
      "Homophone: SUITE sounds like SWEET (sugary); the definition is a set of matching apps, like an office suite.",
  },
  {
    clue: "Succeed in the exam, give your word — keep it secret (8)",
    answer: "PASSWORD",
    explanation:
      "Charade: PASS (succeed in the exam) + WORD (give your word) = PASSWORD — the thing you keep secret.",
  },
  {
    clue: "Grit and a fistfight make a safe place to test code (7)",
    answer: "SANDBOX",
    explanation:
      "Charade: SAND (grit) + BOX (to fistfight) = SANDBOX — the safe, isolated place to test code.",
  },
  {
    clue: "Loose stones head north to reach the display (6)",
    answer: "SCREEN",
    explanation:
      "Charade: SCREE (loose stones on a mountainside) + N (north) = SCREEN — the display.",
  },
  {
    clue: "Saint joins the gang — a run of characters (6)",
    answer: "STRING",
    explanation:
      "Charade: ST (saint) + RING (a gang) = STRING — a run of characters.",
  },
  {
    clue: "On time, awaiting your command (6)",
    answer: "PROMPT",
    explanation:
      "Double definition: PROMPT means on time, and the PROMPT is what sits blinking, awaiting your command.",
  },
];
