export const categorySeedData = [
  { title: "IEEE", color: "#00629b" },
  { title: "VEX", color: "#d22630" },
  { title: "IGVC", color: "#2e7d32" },
  { title: "General", color: "#64748b" },
  { title: "Electrical", color: "#f59e0b" },
  { title: "Mechanical", color: "#f97316" },
  { title: "Computer Science", color: "#8b5cf6" },
] as const;

export type CategoryTitle = (typeof categorySeedData)[number]["title"];
