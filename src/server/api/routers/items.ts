import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

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
        items: items ?? [],
        total,
      };
    }),
});
