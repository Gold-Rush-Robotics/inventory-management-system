import { db } from "@/server/db";
import { PropertyType } from "generated/prisma/enums";
import { faker } from "@faker-js/faker";

// Seed fixtures

const clubMembers = [
  "Alex", "Sean", "Sam", "Hudson",
  "Tyler", "Morgan", "Casey", "Justin"
]
const randomMember = () => faker.helpers.arrayElement(clubMembers)

const tagPool = [
  "Competition Only", "Practice Bot", "Consumable", "Shared",
  "Team Owned", "Needs Repair", "Loaner", "Spare",
  "New", "Used",
]

const categoryPool = [
  "Motors & Actuators", "Sensors", "Controllers", "Batteries & Power",
  "Wiring & Connectors", "Fasteners & Hardware", "Structural / Frame",
  "Wheels & Drivetrain", "Hand Tools", "Power Tools", "Safety Gear",
  "Field Elements", "Spare Parts",
]

const namePool = [
  "NEO Brushless Motor", "REV Robotics Motor Controller", "TalonFX Motor Controller",
  "Limelight Camera", "NavX Gyroscope", "CTRE CANCoder", "Pneumatic Cylinder",
  "Solenoid Valve", "3D Printed Bracket", "Aluminum Extrusion 1x1",
  "Polycarbonate Sheet", "Lithium Battery Pack", "Power Distribution Panel",
  "RoboRIO", "Wheel - Omni 4in", "Wheel - Mecanum 6in", "Bearing Flanged",
  "Chain Link #25", "Gearbox - Versaplanetary", "Servo Motor", "Limit Switch",
  "Compressor", "Pressure Regulator", "CAN Cable", "Zip Ties (Pack)",
  "Hex Bolt Assortment", "Allen Key Set", "Multimeter", "Soldering Iron",
  "Heat Shrink Tubing",
]

function randomLocationTitle(): string {
  const storageType = faker.helpers.arrayElement(
    ["Cabinet", "Shelf", "Bin", "Drawer", "Rack", "Toolbox", "Cart"]
  )
  const label = faker.helpers.arrayElement([
    faker.string.alpha({ length: 1, casing: "upper" }) + faker.number.int({ min: 1, max: 99 }),
    faker.number.int({ min: 1, max: 50 }).toString(),
  ])
  return `${storageType} ${label}`
}

// Alias functions

function tagAliases(title: string): string[] {
  const other = title.toLowerCase().replace(/\s+/g, "-")
  const abbrevMap: Record<string, string[]> = {
    "Competition Only": ["comp-only", "comp"],
    "Practice Bot": ["practice"],
    "Needs Repair": ["broken", "fix-needed"],
    "Team Owned": ["owned", "team"],
    "Consumable": ["consumable", "used-up"],
    "Loaner": ["borrowed", "loan"],
  }
  return abbrevMap[title] ?? [other]
}

function nameAliases(title: string): string[] {
  const abbrevMap: Record<string, string[]> = {
    "NEO Brushless Motor": ["NEO", "NEO Motor"],
    "REV Robotics Motor Controller": ["REV Controller", "Spark Max"],
    "TalonFX Motor Controller": ["TalonFX", "Falcon Controller"],
    "Limelight Camera": ["Limelight", "LL Cam"],
    "NavX Gyroscope": ["NavX", "Gyro"],
    "CTRE CANCoder": ["CANCoder"],
    "RoboRIO": ["RIO", "roboRIO"],
    "Wheel - Omni 4in": ["Omni Wheel", "4in Omni"],
    "Wheel - Mecanum 6in": ["Mecanum Wheel", "6in Mecanum"],
    "Gearbox - Versaplanetary": ["VersaPlanetary", "VP Gearbox"],
  }
  return abbrevMap[title] ?? []
}

// Seed logic
async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed production")
  }

  // Clean db
  await db.item.deleteMany()
  await db.property.deleteMany()


  // Create properties

  const tagProps = await Promise.all(
    tagPool.map((title) =>
      db.property.create({
        data: {
          type: PropertyType.TAG,
          title,
          createdBy: randomMember(),
          aliases: tagAliases(title)
        },
      })
    )
  )

  const categoryProps = await Promise.all(
    categoryPool.map((title) =>
      db.property.create({
        data: { type: PropertyType.CATEGORY, title, createdBy: randomMember() },
      })
    )
  )

  const locationTitles = new Set<string>()
  while (locationTitles.size < 20) {
    locationTitles.add(randomLocationTitle())
  }

  const locationProps = await Promise.all(
    Array.from(locationTitles).map((title) =>
      db.property.create({
        data: {
          type: PropertyType.LOCATION,
          title,
          createdBy: randomMember(),
          aliases: [title.toLowerCase().replace(/\s+/g, '')]
        },
      })
    )
  )

  // Create items
  for (const name of namePool) {
    const requiresCheckout = faker.datatype.boolean();
    const category = faker.helpers.arrayElement(categoryProps);
    const location = faker.helpers.arrayElement(locationProps);
    const tags = faker.helpers.arrayElements(tagProps, { min: 0, max: 3 });
    const createdBy = randomMember();

    await db.item.create({
      data: {
        requiresCheckout,
        maxCheckoutDays: requiresCheckout ? faker.number.int({ min: 1, max: 14 }) : null,
        totalQty: faker.number.int({ min: 0, max: 60 }),
        notifyThreshold: faker.number.int({ min: 0, max: 5 }),
        createdBy,
        properties: {
          connect: [
            { id: category.id },
            { id: location.id },
            ...tags.map((tag) => ({ id: tag.id }))
          ],
          create: [
            {
              type: PropertyType.NAME,
              title: name,
              content: faker.lorem.sentence(),
              createdBy,
              aliases: nameAliases(name)
            }
          ]
        }
      }
    })
  }

}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
