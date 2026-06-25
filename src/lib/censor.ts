const WORDS = [

  "fuck", "shit", "bitch", "asshole", "bastard", "dick", "cunt", "pussy",
  "slut", "whore", "nigger", "nigga", "faggot", "retard", "cock",
  "motherfucker",

  "anjing", "anjir", "bangsat", "babi", "kontol", "memek", "ngentot", "pepek",
  "tolol", "goblok", "kampret", "bajingan", "pelacur", "jancok", "jancuk",
  "asu", "pantek", "puki", "ngewe", "colmek", "kimak",
];


const LEET: Record<string, string> = {
  a: "a4@^", b: "b8", c: "c(", e: "e3", g: "g9", i: "i1!|l", l: "l1|i",
  o: "o0", s: "s5$z", t: "t7+", u: "uv",
};

const GAP = "[^a-z0-9]*";

function fuzzy(word: string): string {
  return word
    .split("")
    .map((ch) => `[${LEET[ch] ?? ch}]+`)
    .join(GAP);
}


const SOURCE = `(?<![a-z0-9])(?:${WORDS.map(fuzzy).join("|")})(?![a-z0-9])`;
const PATTERN = new RegExp(SOURCE, "gi");

export function censor(text: string): string {
  return text.replace(PATTERN, (m) => "*".repeat(m.length));
}

export function hasProfanity(text: string): boolean {
  return new RegExp(SOURCE, "i").test(text);
}
