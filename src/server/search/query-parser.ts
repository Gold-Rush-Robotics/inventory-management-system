export interface ParsedQuery {
  keywords: string;
  tags: string[];
  categories: string[];
  locations: string[];
}

const KEY_TO_BUCKET: Record<string, "tags" | "categories" | "locations"> = {
  tag: "tags",
  tags: "tags",
  cat: "categories",
  category: "categories",
  categories: "categories",
  loc: "locations",
  location: "locations",
  locations: "locations",
};

// Matches just the directive keyword + colon
const KEY_PATTERN = /\b(tags?|cat|categor(?:y|ies)|locations?|loc)\s*:\s*/gi;

// Matches ONE value at the start of a string: a quoted phrase, or a bare
// (unquoted) token that stops at whitespace or a comma.
const VALUE_TOKEN = /^(?:"([^"]+)"|'([^']+)'|([^\s,]+))/;

// Matches a comma separator between values, with optional surrounding whitespace
const COMMA_SEPARATOR = /^\s*,\s*/;

/**
 * Scans raw search text left to right, pulling out `key:value` filter
 * directives (tag:, cat:/category:, loc:/location:) and leaving whatever
 * plain text remains as keywords.
 */
export function parseSearchQuery(raw: string): ParsedQuery {
  const tags: string[] = [];
  const categories: string[] = [];
  const locations: string[] = [];

  let result = "";
  let cursor = 0;

  KEY_PATTERN.lastIndex = 0;
  let keyMatch: RegExpExecArray | null;

  while ((keyMatch = KEY_PATTERN.exec(raw)) !== null) {
    const key = keyMatch[1]!.toLowerCase();
    const directiveStart = keyMatch.index;
    let pos = KEY_PATTERN.lastIndex; // right after "key:" + whitespace

    const values: string[] = [];

    let valueMatch = VALUE_TOKEN.exec(raw.slice(pos));
    while (valueMatch) {
      const value = (
        valueMatch[1] ??
        valueMatch[2] ??
        valueMatch[3] ??
        ""
      ).trim();
      if (value) values.push(value);
      pos += valueMatch[0].length;

      // Only continue parsing more values if a comma follows immediately
      const commaMatch = COMMA_SEPARATOR.exec(raw.slice(pos));
      if (commaMatch) {
        pos += commaMatch[0].length;
        valueMatch = VALUE_TOKEN.exec(raw.slice(pos));
      } else {
        valueMatch = null;
      }
    }

    if (values.length > 0) {
      const bucket = KEY_TO_BUCKET[key];
      if (bucket === "tags") tags.push(...values);
      else if (bucket === "categories") categories.push(...values);
      else if (bucket === "locations") locations.push(...values);
    }

    // Keep the plain text that came before this directive
    result += raw.slice(cursor, directiveStart);
    cursor = pos;
    KEY_PATTERN.lastIndex = pos;
  }

  result += raw.slice(cursor);

  const keywords = result.replace(/\s+/g, " ").trim();

  return { keywords, tags, categories, locations };
}
