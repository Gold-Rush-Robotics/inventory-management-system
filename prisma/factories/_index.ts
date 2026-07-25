import { initialize } from "../../generated/fabbrica";
import type { PrismaClient } from "../../generated/prisma/client";

export { ItemFactory } from "./item";
export { PropertyFactory } from "./property";
export { UserFactory } from "./user";

export function initializeFactories(prisma: PrismaClient) {
  initialize({ prisma });
}
