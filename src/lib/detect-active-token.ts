export type ActiveToken =
  | {
      kind: "directive";
      type: "tag" | "category" | "location";
      query: string;
      start: number;
      end: number;
    }
  | { kind: "plain"; query: string; start: number; end: number };

const DIRECTIVE_KEY = /^(tags?|cat|categor(?:y|ies)|locations?|loc)\s*:\s*/i;

const KEY_TO_TYPE: Record<string, "tag" | "category" | "location"> = {
  tag: "tag",
  tags: "tag",
  cat: "category",
  category: "category",
  categories: "category",
  loc: "location",
  location: "location",
  locations: "location",
};

export function detectActiveToken(
  text: string,
  cursorPos: number,
): ActiveToken {
  let start = cursorPos;
  while (start > 0 && !/\s/.test(text[start - 1]!)) start--;
  let end = cursorPos;
  while (end < text.length && !/\s/.test(text[end]!)) end++;

  const token = text.slice(start, end);
  const match = DIRECTIVE_KEY.exec(token);

  if (match) {
    const type = KEY_TO_TYPE[match[1]!.toLowerCase()];
    if (type) {
      const valueStart = start + match[0].length;
      const query = text.slice(valueStart, cursorPos).replace(/^["']/, "");
      return { kind: "directive", type, query, start: valueStart, end };
    }
  }

  return { kind: "plain", query: token, start, end };
}
