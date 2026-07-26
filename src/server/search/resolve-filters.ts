import Fuse from "fuse.js";
import type { PrismaClient } from "../../../generated/prisma/client";
import type { PropertyType } from "../../../generated/prisma/enums";

interface PropertyForResolve {
  id: number;
  title: string;
  aliases: string[];
}

export async function resolveFilterIds(
  db: PrismaClient,
  type: (typeof PropertyType)[keyof typeof PropertyType],
  rawValues: string[],
): Promise<number[]> {
  if (rawValues.length === 0) return [];

  // All properties of type, type
  const allOfType: PropertyForResolve[] = await db.property.findMany({
    where: { type },
    select: { id: true, title: true, aliases: true },
  });

  const resolvedIds = new Set<number>();
  const unmatched: string[] = [];

  // Look for exact and substring matches, else unmatched
  for (const raw of rawValues) {
    const normalized = raw.toLowerCase();
    const exactMatches = allOfType.filter(
      (p) =>
        p.title.toLowerCase() === normalized ||
        p.aliases.some((a) => a.toLowerCase() === normalized),
    );

    if (exactMatches.length > 0) {
      exactMatches.forEach((p) => resolvedIds.add(p.id));
      continue;
    }

    const substringMatches = allOfType.filter(
      (p) =>
        p.title.toLowerCase().includes(normalized) ||
        p.aliases.some((a) => a.toLowerCase().includes(normalized)),
    );
    if (substringMatches.length > 0) {
      substringMatches.forEach((p) => resolvedIds.add(p.id));
      continue;
    }

    unmatched.push(raw);
  }

  // Fall back to fuzzy for unmatched
  if (unmatched.length > 0 && allOfType.length > 0) {
    const fuse = new Fuse(allOfType, {
      keys: [
        { name: "title", weight: 0.7 },
        { name: "aliases", weight: 0.3 },
      ],
      includeScore: true,
      threshold: 0.3,
      ignoreLocation: true,
    });

    for (const raw of unmatched) {
      const matches = fuse.search(raw);
      matches.forEach((m) => resolvedIds.add(m.item.id));
    }
  }

  return Array.from(resolvedIds);
}
