import { propertyDataSchemas, type Property } from "@/lib/types/PropertyData";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  buildPropertyWhere,
  searchItemIds,
  type FilterState,
} from "../search/items-search";
import { parseSearchQuery } from "../search/query-parser";
import { resolveFilterIds } from "../search/resolve-aliases";
import { z } from "zod";
import { Prisma } from "../../../../generated/prisma/client";
import { PropertyType } from "../../../../generated/prisma/enums";
import type { PropertyModel as PrismaProperty } from "../../../../generated/prisma/models/Property";

const MIN_KEYWORD_LENGTH = 3;

function parseProperty(property: PrismaProperty) {
  const data = propertyDataSchemas[property.type].parse(property.data);
  return { ...property, data } as Property;
}

const createItemInput = z.object({
  name: z.string().trim().min(3).max(80),
  description: z.string().max(5000),
  buyLink: z.union([z.literal(""), z.string().url()]),
  requireCheckout: z.boolean(),
  tags: z.array(z.number().int().positive()),
  categories: z.array(z.number().int().positive()).min(1),
  location: z.array(z.number().int().positive()).length(1),
  notifyThreshold: z.number().int().min(-1).max(1000),
  trackStock: z.boolean(),
  stock: z.number().int().min(0).max(100000),
});

function linkedPropertiesSchema(
  linked: ReadonlyArray<{ id: number; type: string }>,
) {
  const typeById = new Map(
    linked.map((property) => [property.id, property.type]),
  );

  function idsOfType(type: "TAG" | "CATEGORY" | "LOCATION", message: string) {
    return z.array(z.number().int().positive()).superRefine((ids, ctx) => {
      ids.forEach((id, index) => {
        if (typeById.get(id) !== type) {
          ctx.addIssue({ code: "custom", path: [index], message });
        }
      });
    });
  }

  return z.object({
    tags: idsOfType("TAG", "Must be an existing tag"),
    categories: idsOfType("CATEGORY", "Must be an existing category"),
    location: idsOfType("LOCATION", "Must be an existing location"),
  });
}

export const itemsRouter = createTRPCRouter({
  get: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        tagIds: z.array(z.number().int().positive()).optional(),
        categoryIds: z.array(z.number().int().positive()).optional(),
        locationIds: z.array(z.number().int().positive()).optional(),
        page: z.number().optional(),
        limit: z.number().min(1).max(200).default(25),
      }),
    )
    .query(async ({ ctx, input }) => {
      const skip = input.page ? (input.page - 1) * input.limit : 0;

      // Fallback: any directive syntax typed by hand but never confirmed
      const parsed = parseSearchQuery(input.search ?? "");

      const [parsedTagIds, parsedCategoryIds, parsedLocationIds] =
        await Promise.all([
          resolveFilterIds(ctx.db, PropertyType.TAG, parsed.tags),
          resolveFilterIds(ctx.db, PropertyType.CATEGORY, parsed.categories),
          resolveFilterIds(ctx.db, PropertyType.LOCATION, parsed.locations),
        ]);

      const explicitTagIds = input.tagIds ?? [];
      const explicitCategoryIds = input.categoryIds ?? [];
      const explicitLocationIds = input.locationIds ?? [];

      const filters: FilterState = {
        tagIds: Array.from(new Set([...explicitTagIds, ...parsedTagIds])),
        categoryIds: Array.from(
          new Set([...explicitCategoryIds, ...parsedCategoryIds]),
        ),
        locationIds: Array.from(
          new Set([...explicitLocationIds, ...parsedLocationIds]),
        ),
        tagsRequested: explicitTagIds.length > 0 || parsed.tags.length > 0,
        categoriesRequested:
          explicitCategoryIds.length > 0 || parsed.categories.length > 0,
        locationsRequested:
          explicitLocationIds.length > 0 || parsed.locations.length > 0,
      };

      const keywords = parsed.keywords;
      const hasSearchableKeywords = keywords.length >= MIN_KEYWORD_LENGTH;

      if (!hasSearchableKeywords) {
        const where = buildPropertyWhere(filters);

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

      const { ids, total } = await searchItemIds(ctx.db, keywords, filters, {
        limit: input.limit,
        skip,
      });

      if (ids.length === 0) {
        return { items: [], total };
      }

      const items = await ctx.db.item.findMany({
        where: { id: { in: ids } },
        include: { properties: true },
      });

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

  create: protectedProcedure
    .input(createItemInput)
    .mutation(async ({ ctx, input }) => {
      const tags = [...new Set(input.tags)];
      const categories = [...new Set(input.categories)];
      const location = [...new Set(input.location)];
      const propertyIds = [...tags, ...categories, ...location];

      const linked = await ctx.db.property.findMany({
        where: { id: { in: propertyIds } },
        select: { id: true, type: true },
      });
      linkedPropertiesSchema(linked).parse({ tags, categories, location });

      const buyLink = input.buyLink || undefined;

      const item = await ctx.db.item.create({
        data: {
          requiresCheckout: input.requireCheckout || input.trackStock,
          totalQty: input.trackStock ? input.stock : null,
          notifyThreshold: input.trackStock ? input.notifyThreshold : null,
          createdBy: { connect: { id: ctx.session.user.id } },
          properties: {
            create: {
              type: "NAME",
              title: input.name,
              content: input.description,
              data: buyLink ? { buyLink } : Prisma.DbNull,
              createdBy: { connect: { id: ctx.session.user.id } },
            },
            connect: propertyIds.map((id) => ({ id })),
          },
        },
        include: {
          properties: true,
        },
      });

      return {
        ...item,
        properties: item.properties.map(parseProperty),
      };
    }),
});
