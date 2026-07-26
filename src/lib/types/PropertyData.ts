import { z } from "zod";
import type {
  Property as PrismaProperty,
  PropertyType,
} from "../../../generated/prisma/client";

export const tagDataSchema = z.object({
  color: z.string(),
});

export const categoryDataSchema = z.object({
  color: z.string(),
});

export const propertyDataSchemas = {
  NAME: z.null(),
  CATEGORY: categoryDataSchema,
  TAG: tagDataSchema,
  LOCATION: z.null(),
} as const satisfies Record<PropertyType, z.ZodType>;

export type PropertyDataMap = {
  [K in PropertyType]: z.infer<(typeof propertyDataSchemas)[K]>;
};

export type TypedProperty<T extends PropertyType> = Omit<
  PrismaProperty,
  "type" | "data"
> & {
  type: T;
  data: PropertyDataMap[T];
};

export type Property = { [T in PropertyType]: TypedProperty<T> }[PropertyType];
