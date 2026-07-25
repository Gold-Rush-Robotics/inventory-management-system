import type { Property } from "../../generated/prisma/client";
import { PropertyType } from "../../generated/prisma/enums";
import { PropertyFactory } from "../factories/_index";
import { categorySeedData } from "./data/categories";
import { randomLocationTitle } from "./data/locations";
import { tagSeedData } from "./data/tags";

export interface SeedProperties {
  categories: Property[];
  locations: Property[];
  tags: Property[];
}

export async function seedProperties() {
  const tags = await PropertyFactory.createList(
    tagSeedData.map((tag) => ({
      type: PropertyType.TAG,
      title: tag.title,
      aliases: "aliases" in tag ? [...tag.aliases] : [],
      data: { color: tag.color },
    })),
  );

  const categories = await PropertyFactory.createList(
    categorySeedData.map((category) => ({
      type: PropertyType.CATEGORY,
      title: category.title,
      data: { color: category.color },
    })),
  );

  const locationTitles = new Set<string>();
  while (locationTitles.size < 20) {
    locationTitles.add(randomLocationTitle());
  }

  const locations = await PropertyFactory.createList(
    Array.from(locationTitles, (title) => ({
      type: PropertyType.LOCATION,
      title,
    })),
  );

  return { categories, locations, tags };
}
