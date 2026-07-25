export const tagSeedData = [
  {
    title: "Motors & Actuators",
    color: "#dc2626",
  },
  {
    title: "Motor Controllers",
    aliases: ["Motor Drivers", "Electronic Speed Controllers"],
    color: "#ea580c",
  },
  {
    title: "Sensors",
    color: "#0891b2",
  },
  {
    title: "Batteries & Power",
    color: "#eab308",
  },
  {
    title: "Wiring & Connectors",
    aliases: ["Cables"],
    color: "#f59e0b",
  },
  {
    title: "Fasteners & Hardware",
    color: "#78716c",
  },
  {
    title: "Screws",
    color: "#57534e",
  },
  {
    title: "Structural & Frame",
    aliases: ["Chassis"],
    color: "#64748b",
  },
  {
    title: "Wheels & Drivetrain",
    aliases: ["Drive System"],
    color: "#2563eb",
  },
  {
    title: "Pneumatics",
    aliases: ["Compressed Air"],
    color: "#06b6d4",
  },
  {
    title: "Computing",
    color: "#7c3aed",
  },
  {
    title: "Hand Tools",
    color: "#16a34a",
  },
  {
    title: "Power Tools",
    color: "#b91c1c",
  },
  {
    title: "Safety Equipment",
    aliases: ["PPE"],
    color: "#f97316",
  },
] as const;

export type TagTitle = (typeof tagSeedData)[number]["title"];
