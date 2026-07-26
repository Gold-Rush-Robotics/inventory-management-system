import { propertyDataSchemas, type Property } from "@/lib/types/PropertyData";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { parseSearchQuery } from "@/server/search/query-parser";
import { resolveFilterIds } from "@/server/search/resolve-filters";
import {
  buildPropertyWhere,
  searchItemIds,
} from "@/server/search/items-search";
import { z } from "zod";
import { PropertyType } from "../../../../generated/prisma/enums";
import type { PropertyModel as PrismaProperty } from "../../../../generated/prisma/models/Property";

function parseProperty(property: PrismaProperty) {
  const data = propertyDataSchemas[property.type].parse(property.data);
  return { ...property, data } as Property;
}

export const itemsRouter = createTRPCRouter({
  // create: protectedProcedure
  //   .input(z.object({ name: z.string().min(1), description: z.string().optional(), quantity: z.number(), unit: z.string(), price: z.number() }))
  //   .mutation(async ({ ctx, input }) => {
  //     return ctx.db.post.create({
  //       data: {
  //         name: input.name,
  //         createdBy: { connect: { id: ctx.session.user.id } },
  //       },
  //     });
  //   }),

  get: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        page: z.number().optional(),
        limit: z.number().min(1).max(200).default(25),
      }),
    )
    .query(async ({ ctx, input }) => {
      const skip = input.page ? (input.page - 1) * input.limit : 0;

      const parsed = parseSearchQuery(input.search ?? "");

      const [tagIds, categoryIds, locationIds] = await Promise.all([
        resolveFilterIds(ctx.db, PropertyType.TAG, parsed.tags),
        resolveFilterIds(ctx.db, PropertyType.CATEGORY, parsed.categories),
        resolveFilterIds(ctx.db, PropertyType.LOCATION, parsed.locations),
      ]);

      const requested = {
        tags: parsed.tags,
        categories: parsed.categories,
        locations: parsed.locations,
      };
      const filters = { tagIds, categoryIds, locationIds };
      const keywords = parsed.keywords;

      // Might be good to add min keyword length here
      if (!keywords) {
        const where = buildPropertyWhere(filters, requested);

        const [items, total] = await Promise.all([
          ctx.db.item.findMany({
            where,
            orderBy: { editedAt: "desc" },
            include: { properties: true },
            take: input.limit,
            skip,
          }),
          ctx.db.item.count({ where }),
        ]);

        return {
          items: items.map((item) => ({
            ...item,
            properties: item.properties.map(parseProperty),
          })),
          total,
        };
      }

      // Fuzzy search against item NAME + its aliases and matching filters
      const { ids, total } = await searchItemIds(
        ctx.db,
        keywords,
        filters,
        requested,
        {
          limit: input.limit,
          skip,
        },
      );

      if (ids.length === 0) {
        return { items: [], total };
      }

      const items = await ctx.db.item.findMany({
        where: { id: { in: ids } },
        include: { properties: true },
      });

      // Prisma doesn't preserve `id: { in: [...] }` order,
      // reorder to match the ranking in searchItemIds
      const itemsById = new Map(items.map((item) => [item.id, item]));
      const ordered = ids
        .map((id) => itemsById.get(id))
        .filter((item): item is NonNullable<typeof item> => item !== undefined);

      return {
        items: ordered.map((item) => ({
          ...item,
          properties: item.properties.map(parseProperty),
        })),
        total,
      };
    }),
});
