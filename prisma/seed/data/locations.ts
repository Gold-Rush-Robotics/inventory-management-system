import { faker } from "@faker-js/faker";

export function randomLocationTitle() {
  const storageType = faker.helpers.arrayElement([
    "Cabinet",
    "Shelf",
    "Bin",
    "Drawer",
    "Rack",
    "Toolbox",
    "Cart",
  ]);
  const label = faker.helpers.arrayElement([
    faker.string.alpha({ length: 1, casing: "upper" }) +
      faker.number.int({ min: 1, max: 99 }),
    faker.number.int({ min: 1, max: 50 }).toString(),
  ]);

  return `${storageType} ${label}`;
}
