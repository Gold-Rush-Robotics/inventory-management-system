import { faker } from "@faker-js/faker";
import type { Property } from "../../generated/prisma/client";
import { PropertyType } from "../../generated/prisma/enums";
import { ItemFactory, PropertyFactory } from "../factories/_index";
import { itemSeedData } from "./data/items";
import type { SeedProperties } from "./properties";

function propertyId(properties: Property[], title: string) {
  const property = properties.find((candidate) => candidate.title === title);
  if (!property) {
    throw new Error(`Missing seeded property: ${title}`);
  }

  return { id: property.id };
}

export async function seedItems(properties: SeedProperties) {
  const items = await Promise.all(
    itemSeedData.map(async (item) => {
      const location = faker.helpers.arrayElement(properties.locations);
      const name = await PropertyFactory.build({
        type: PropertyType.NAME,
        title: item.name,
        content: faker.lorem.sentence(),
        aliases: item.aliases ?? [],
      });

      return {
        properties: {
          connect: [
            { id: location.id },
            ...item.categories.map((title) =>
              propertyId(properties.categories, title),
            ),
            ...item.tags.map((title) => propertyId(properties.tags, title)),
          ],
          create: name,
        },
      };
    }),
  );

  await ItemFactory.createList(items);
}
