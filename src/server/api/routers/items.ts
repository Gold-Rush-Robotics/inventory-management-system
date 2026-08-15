import { propertyDataSchemas, type Property } from "@/lib/types/PropertyData";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { Prisma } from "../../../../generated/prisma/client";
import type { PropertyModel as PrismaProperty } from "../../../../generated/prisma/models/Property";

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

/** After loading rows from the db, check that each id exists as the expected type. */
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
        query: z
          .object({
            // todo: add query schema for searching
          })
          .optional(),
        page: z.number().optional(),
        limit: z.number().min(1).max(200).default(25),
      }),
    )
    .query(async ({ ctx, input }) => {
      // todo: build where from input.query when search is added
      const where = undefined;

      const [items, total] = await Promise.all([
        ctx.db.item.findMany({
          where,
          orderBy: { editedAt: "desc" }, // todo: proper ordering
          include: {
            properties: true,
          },
          take: input.limit,
          skip: input.page ? (input.page - 1) * input.limit : 0,
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
