/** Note - this is temporary, should be replaced with the more robust search in the search feature. */

export type MatchableOption = {
  title: string;
  aliases?: string[];
};

function normalize(value: string) {
  return value.trim().toLocaleLowerCase();
}

/** Lower scores are better matches, `Infinity` means no match at all. */
function matchScore(option: MatchableOption, query: string) {
  const title = normalize(option.title);
  const aliases = (option.aliases ?? []).map(normalize);

  if (!query || title === query) return 0;
  if (title.startsWith(query)) return 1;
  if (title.includes(query)) return 2;
  if (aliases.some((alias) => alias === query)) return 3;
  if (aliases.some((alias) => alias.startsWith(query))) return 4;
  if (aliases.some((alias) => alias.includes(query))) return 5;
  return Number.POSITIVE_INFINITY;
}

/** Options that match `search` on their title or aliases, best match first. */
export function matchOptions<T extends MatchableOption>(
  options: T[],
  search: string,
) {
  const query = normalize(search);

  return options
    .map((option) => ({ option, score: matchScore(option, query) }))
    .filter(({ score }) => Number.isFinite(score))
    .sort(
      (a, b) =>
        a.score - b.score || a.option.title.localeCompare(b.option.title),
    )
    .map(({ option }) => option);
}
