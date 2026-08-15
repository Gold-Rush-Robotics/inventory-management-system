import { propertyDataSchemas } from "@/lib/types/PropertyData";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

/**
 * Property types that are user managed lists of colored labels. They are stored
 * and edited identically and only differ by their `type` in the database.
 */
export const labelPropertyTypeSchema = z.enum(["TAG", "CATEGORY"]);

export type LabelPropertyType = z.infer<typeof labelPropertyTypeSchema>;

const colorSchema = z.string().regex(/^#[0-9a-f]{6}$/i, "Invalid hex color");

function parseProperty<T extends { data: unknown }>(
  property: T,
  type: LabelPropertyType,
) {
  return { ...property, data: propertyDataSchemas[type].parse(property.data) };
}

export const propertiesRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ type: labelPropertyTypeSchema }))
    .query(async ({ ctx, input }) => {
      const properties = await ctx.db.property.findMany({
        where: { type: input.type },
        orderBy: { title: "asc" },
      });

      return properties.map((property) => parseProperty(property, input.type));
    }),

  listLocations: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.property.findMany({
      where: { type: "LOCATION" },
      orderBy: { title: "asc" },
      select: { id: true, title: true, aliases: true },
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        type: labelPropertyTypeSchema,
        title: z.string().trim().min(1).max(80),
        aliases: z.array(z.string().trim().min(1).max(80)).max(20),
        color: colorSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const property = await ctx.db.property.create({
        data: {
          type: input.type,
          title: input.title,
          aliases: [...new Set(input.aliases)],
          data: { color: input.color },
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });

      return parseProperty(property, input.type);
    }),
});
