import Fuse, { type IFuseOptions } from "fuse.js";
import type { PrismaClient } from "../../../generated/prisma/client";

export interface ResolvedFilterIds {
  tagIds: number[];
  categoryIds: number[];
  locationIds: number[];
}

export interface RequestedFilters {
  tags: string[];
  categories: string[];
  locations: string[];
}

export function buildPropertyWhere(
  resolved: ResolvedFilterIds,
  requested: RequestedFilters,
) {
  const conditions: object[] = [];

  if (requested.tags.length > 0) {
    conditions.push({ properties: { some: { id: { in: resolved.tagIds } } } });
  }
  if (requested.categories.length > 0) {
    conditions.push({
      properties: { some: { id: { in: resolved.categoryIds } } },
    });
  }
  if (requested.locations.length > 0) {
    conditions.push({
      properties: { some: { id: { in: resolved.locationIds } } },
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
  ],
  includeScore: true,
  threshold: 0.3,
  ignoreLocation: true,
};

export async function searchItemIds(
  db: PrismaClient,
  search: string,
  resolved: ResolvedFilterIds,
  requested: RequestedFilters,
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

  // Get items by name
  const searchable: SearchableName[] = names.flatMap((p) =>
    p.items.map((item) => ({
      itemId: item.id,
      title: p.title,
      aliases: p.aliases,
    })),
  );

  const fuse = new Fuse(searchable, fuseOptions);
  const results = fuse.search(search);

  // Keep each item's best result
  const bestScoreByItem = new Map<number, number>();
  for (const result of results) {
    const score = result.score ?? 1;
    const existing = bestScoreByItem.get(result.item.itemId);
    if (existing === undefined || score < existing) {
      bestScoreByItem.set(result.item.itemId, score);
    }
  }

  let candidateIds = Array.from(bestScoreByItem.keys());

  const propertyWhere = buildPropertyWhere(resolved, requested);
  const hasFilters =
    requested.tags.length > 0 ||
    requested.categories.length > 0 ||
    requested.locations.length > 0;

  // Get all item id's that pass the filters,
  // this will still try if any filter was input at all
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

  // Best match first (lower Fuse score = better)
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
