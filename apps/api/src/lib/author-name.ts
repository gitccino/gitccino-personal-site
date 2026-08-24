const adjectives = [
  "Bright",
  "Calm",
  "Clever",
  "Crisp",
  "Curious",
  "Gentle",
  "Kind",
  "Lively",
  "Quiet",
  "Witty",
] as const;

const nouns = [
  "Birch",
  "Cedar",
  "Cloud",
  "Fern",
  "Harbor",
  "Maple",
  "Meadow",
  "Pebble",
  "River",
  "Willow",
] as const;

function pickWord(words: readonly string[], random: () => number): string {
  const index = Math.floor(random() * words.length);
  return words[index] ?? words[0] ?? "Anonymous";
}

export function createAuthorName(random: () => number = Math.random): string {
  return `${pickWord(adjectives, random)} ${pickWord(nouns, random)}`;
}
