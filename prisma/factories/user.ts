import { faker } from "@faker-js/faker";
import { defineUserFactory } from "../../generated/fabbrica";

export const UserFactory = defineUserFactory({
  defaultData: async ({ seq }) => {
    const name = [faker.person.firstName(), faker.person.lastName()] as const;

    return {
      id: faker.string.uuid(),
      name: name.join(" "),
      email: `${name[0].toLowerCase()}.${name[1].toLowerCase()}${seq}@example.com`,
    };
  },
});
