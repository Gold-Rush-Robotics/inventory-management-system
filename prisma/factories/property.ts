import { definePropertyFactory } from "../../generated/fabbrica";
import { UserFactory } from "./user";

export const PropertyFactory = definePropertyFactory({
  defaultData: {
    createdBy: UserFactory,
  },
});
