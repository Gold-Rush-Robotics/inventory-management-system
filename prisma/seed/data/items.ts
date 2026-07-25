import type { CategoryTitle } from "./categories";
import type { TagTitle } from "./tags";

export interface ItemSeedData {
  name: string;
  aliases?: string[];
  categories: CategoryTitle[];
  tags: TagTitle[];
}

export const itemSeedData = [
  {
    name: "REV NEO 1.1 Brushless Motor",
    categories: ["IEEE", "Electrical", "Mechanical"],
    tags: ["Motors & Actuators"],
  },
  {
    name: "REV SPARK MAX Motor Controller",
    categories: ["IEEE", "Electrical"],
    tags: ["Motor Controllers"],
  },
  {
    name: "CTRE Talon FX Motor Controller",
    categories: ["IEEE", "Electrical"],
    tags: ["Motor Controllers"],
  },
  {
    name: "Limelight 3 Smart Camera",
    categories: ["IEEE", "IGVC", "Electrical", "Computer Science"],
    tags: ["Sensors", "Computing"],
  },
  {
    name: "Studica navX2-MXP",
    categories: ["IEEE", "IGVC", "Electrical", "Computer Science"],
    tags: ["Sensors"],
  },
  {
    name: "CTRE CANcoder Magnetic Encoder",
    categories: ["IEEE", "IGVC", "Electrical"],
    tags: ["Sensors"],
  },
  {
    name: "VEX V5 Robot Brain",
    categories: ["VEX", "Electrical", "Computer Science"],
    tags: ["Computing", "Motor Controllers"],
  },
  {
    name: "VEX V5 Smart Motor 11W",
    categories: ["VEX", "Electrical", "Mechanical"],
    tags: ["Motors & Actuators"],
  },
  {
    name: "VEX V5 Li-Ion Robot Battery 1100mAh",
    categories: ["VEX", "Electrical"],
    tags: ["Batteries & Power"],
  },
  {
    name: "Slamtec RPLIDAR A1",
    categories: ["IGVC", "Electrical", "Computer Science"],
    tags: ["Sensors"],
  },
  {
    name: "NVIDIA Jetson Orin Nano 8GB",
    categories: ["IGVC", "Electrical", "Computer Science"],
    tags: ["Computing"],
  },
  {
    name: "u-blox ZED-F9P GPS Module",
    categories: ["IGVC", "Electrical", "Computer Science"],
    tags: ["Sensors"],
  },
  {
    name: "12V Emergency Stop Push Button",
    aliases: ["E-Stop"],
    categories: ["IGVC", "Electrical"],
    tags: ["Safety Equipment", "Wiring & Connectors"],
  },
  {
    name: "Bimba 3/4-inch Bore Pneumatic Cylinder, 4-inch Stroke",
    categories: ["IEEE", "Mechanical"],
    tags: ["Pneumatics", "Motors & Actuators"],
  },
  {
    name: "12V 1/4-inch NPT Pneumatic Solenoid Valve",
    categories: ["IEEE", "Electrical", "Mechanical"],
    tags: ["Pneumatics", "Motors & Actuators"],
  },
  {
    name: "REV 6061 Aluminum Extrusion, 1 x 1 x 36-inch",
    categories: ["IEEE", "General", "Mechanical"],
    tags: ["Structural & Frame"],
  },
  {
    name: "1/8-inch Polycarbonate Sheet, 24 x 48-inch",
    aliases: ["1/8-inch Lexan Sheet, 24 x 48-inch"],
    categories: ["General", "Mechanical"],
    tags: ["Structural & Frame"],
  },
  {
    name: "12V 18Ah Sealed Lead-Acid Battery",
    aliases: ["12V 18Ah SLA Battery"],
    categories: ["IEEE", "IGVC", "Electrical"],
    tags: ["Batteries & Power"],
  },
  {
    name: "REV Power Distribution Hub",
    aliases: ["PDH"],
    categories: ["IEEE", "Electrical"],
    tags: ["Batteries & Power"],
  },
  {
    name: "NI roboRIO 2.0",
    categories: ["IEEE", "Electrical", "Computer Science"],
    tags: ["Computing", "Motor Controllers"],
  },
  {
    name: "4-inch Omni Wheel, 1/2-inch Hex Bore",
    categories: ["IEEE", "General", "Mechanical"],
    tags: ["Wheels & Drivetrain"],
  },
  {
    name: "6-inch Mecanum Wheel, 1/2-inch Hex Bore",
    categories: ["IEEE", "General", "Mechanical"],
    tags: ["Wheels & Drivetrain"],
  },
  {
    name: "608-2RS Flanged Ball Bearing",
    categories: ["General", "Mechanical"],
    tags: ["Wheels & Drivetrain"],
  },
  {
    name: "#25 Roller Chain",
    categories: ["General", "Mechanical"],
    tags: ["Wheels & Drivetrain"],
  },
  {
    name: "VersaPlanetary 10:1 Gearbox",
    aliases: ["VP 10:1 Gearbox"],
    categories: ["IEEE", "General", "Mechanical"],
    tags: ["Wheels & Drivetrain"],
  },
  {
    name: "20 kg-cm Metal Gear PWM Servo",
    categories: ["General", "Electrical", "Mechanical"],
    tags: ["Motors & Actuators"],
  },
  {
    name: "Roller Lever Limit Switch, SPDT",
    categories: ["General", "Electrical"],
    tags: ["Sensors"],
  },
  {
    name: "12V Viair 90C Air Compressor",
    categories: ["IEEE", "Mechanical"],
    tags: ["Pneumatics"],
  },
  {
    name: "0-60 PSI Pneumatic Pressure Regulator",
    categories: ["IEEE", "Mechanical"],
    tags: ["Pneumatics"],
  },
  {
    name: "18 AWG Yellow/Green Twisted CAN Wire",
    categories: ["General", "Electrical"],
    tags: ["Wiring & Connectors"],
  },
  {
    name: "Black Nylon Zip Tie",
    aliases: ["Black Nylon Cable Ties"],
    categories: ["General", "Electrical", "Mechanical"],
    tags: ["Fasteners & Hardware", "Wiring & Connectors"],
  },
  {
    name: "M3 x 8mm Phillips Pan Head Machine Screw",
    categories: ["General", "Mechanical"],
    tags: ["Fasteners & Hardware", "Screws"],
  },
  {
    name: "M4 x 12mm Button Head Socket Cap Screw",
    categories: ["General", "Mechanical"],
    tags: ["Fasteners & Hardware", "Screws"],
  },
  {
    name: "M5 x 16mm Flat Head Socket Cap Screw",
    categories: ["General", "Mechanical"],
    tags: ["Fasteners & Hardware", "Screws"],
  },
  {
    name: "M6 x 20mm Socket Head Cap Screw",
    aliases: ["M6 x 20mm Allen Bolt"],
    categories: ["General", "Mechanical"],
    tags: ["Fasteners & Hardware", "Screws"],
  },
  {
    name: "Metric Hex Key Set, 1.5-10mm",
    aliases: ["Metric Allen Key Set"],
    categories: ["General", "Mechanical"],
    tags: ["Hand Tools"],
  },
  {
    name: "Fluke 115 Digital Multimeter",
    categories: ["General", "Electrical"],
    tags: ["Hand Tools"],
  },
  {
    name: "Hakko FX-888D Soldering Station",
    categories: ["General", "Electrical"],
    tags: ["Power Tools"],
  },
  {
    name: "3:1 Adhesive-Lined Heat Shrink Tubing",
    categories: ["General", "Electrical"],
    tags: ["Wiring & Connectors"],
  },
] satisfies ItemSeedData[];
