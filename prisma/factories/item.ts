import { faker } from "@faker-js/faker";
import { defineItemFactory } from "../../generated/fabbrica";
import { PropertyType } from "../../generated/prisma/enums";
import { UserFactory } from "./user";

export const ItemFactory = defineItemFactory({
  defaultData: async () => {
    const requiresCheckout = faker.datatype.boolean();

    return {
      requiresCheckout,
      maxCheckoutDays: requiresCheckout ? 14 : null,
      totalQty: requiresCheckout
        ? faker.number.int({ min: 0, max: 100 })
        : null,
      notifyThreshold: requiresCheckout
        ? faker.number.int({ min: 0, max: 10 })
        : null,
      createdBy: UserFactory,
      properties: {
        create: {
          type: PropertyType.NAME,
          title: faker.commerce.productName(),
          content: faker.commerce.productDescription(),
          createdBy: {
            create: await UserFactory.build(),
          },
        },
      },
    };
  },
  traits: {
    requiresCheckout: {
      data: {
        requiresCheckout: true,
        maxCheckoutDays: 14,
      },
    },
    lowStock: {
      data: {
        totalQty: 1,
        notifyThreshold: 5,
      },
    },
  },
});
