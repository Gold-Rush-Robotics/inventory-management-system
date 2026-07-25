import { db } from "@/server/db";
import { initializeFactories } from "./factories/_index";
import { seedItems } from "./seed/items";
import { seedProperties } from "./seed/properties";

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed production");
  }

  initializeFactories(db);

  // Delete existing data
  await db.item.deleteMany();
  await db.property.deleteMany();

  // Seed data
  const properties = await seedProperties();
  await seedItems(properties); // depends on properties
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
