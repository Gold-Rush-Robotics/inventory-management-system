import Fuse, { type IFuseOptions } from "fuse.js";
import type { PrismaClient } from "generated/prisma/client";

/**
 * Ids can come from two sources: chips the user already confirmed via a
 * suggestion (client-resolved, trusted as-is), or leftover directive text
 * typed but never confirmed (server-resolved as a fallback). Both get
 * merged into this single shape before filtering. The `*Requested` flags
 * exist so a filter that was requested but resolved to zero properties
 * still produces zero results, instead of being silently skipped.
 */
export interface FilterState {
  tagIds: number[];
  categoryIds: number[];
  locationIds: number[];
  tagsRequested: boolean;
  categoriesRequested: boolean;
  locationsRequested: boolean;
}

export function buildPropertyWhere(filters: FilterState) {
  const conditions: object[] = [];

  if (filters.tagsRequested) {
    conditions.push({ properties: { some: { id: { in: filters.tagIds } } } });
  }
  if (filters.categoriesRequested) {
    conditions.push({
      properties: { some: { id: { in: filters.categoryIds } } },
    });
  }
  if (filters.locationsRequested) {
    conditions.push({
      properties: { some: { id: { in: filters.locationIds } } },
    });
  }

  return conditions.length ? { AND: conditions } : {};
}

interface SearchableName {
  itemId: number;
  title: string;
  aliases: string[];
}

const fuseOptions: IFuseOptions<SearchableName> = {
  keys: [
    { name: "title", weight: 0.7 },
    { name: "aliases", weight: 0.3 },
    // TODO: Update to use desc
  ],
  includeScore: true,
  threshold: 0.3,
  ignoreLocation: true,
};

export async function searchItemIds(
  db: PrismaClient,
  search: string,
  filters: FilterState,
  pagination: { limit: number; skip: number },
): Promise<{ ids: number[]; total: number }> {
  const names = await db.property.findMany({
    where: { type: "NAME" },
    select: {
      title: true,
      aliases: true,
      items: { select: { id: true } },
    },
  });

  const searchable: SearchableName[] = names.flatMap((p) =>
    p.items.map((item) => ({
      itemId: item.id,
      title: p.title,
      aliases: p.aliases,
    })),
  );

  const fuse = new Fuse(searchable, fuseOptions);
  const results = fuse.search(search);

  const bestScoreByItem = new Map<number, number>();
  for (const result of results) {
    const score = result.score ?? 1;
    const existing = bestScoreByItem.get(result.item.itemId);
    if (existing === undefined || score < existing) {
      bestScoreByItem.set(result.item.itemId, score);
    }
  }

  let candidateIds = Array.from(bestScoreByItem.keys());

  const propertyWhere = buildPropertyWhere(filters);
  const hasFilters =
    filters.tagsRequested ||
    filters.categoriesRequested ||
    filters.locationsRequested;

  if (hasFilters) {
    const filteredItems =
      candidateIds.length > 0
        ? await db.item.findMany({
            where: { id: { in: candidateIds }, ...propertyWhere },
            select: { id: true },
          })
        : [];
    const allowedIds = new Set(filteredItems.map((i) => i.id));
    candidateIds = candidateIds.filter((id) => allowedIds.has(id));
  }

  candidateIds.sort(
    (a, b) => bestScoreByItem.get(a)! - bestScoreByItem.get(b)!,
  );

  const total = candidateIds.length;
  const ids = candidateIds.slice(
    pagination.skip,
    pagination.skip + pagination.limit,
  );

  return { ids, total };
}
