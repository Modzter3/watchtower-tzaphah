const replacements: [RegExp, string][] = [
  [/\bGod\b/g, "Yahuah"],
  [/\bLORD\b/g, "Yahuah"],
  [/\bLord\b/g, "Master"],
  [/\bJesus\b/g, "Yahusha"],
  [/\bChrist\b/g, "Messiah"],
  [/\bSatan\b/g, "the adversary"],
];

export function applySacredNames(text: string): string {
  let out = text;
  for (const [re, val] of replacements) {
    out = out.replace(re, val);
  }
  return out;
}
