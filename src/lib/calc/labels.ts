import type { Shape, UnitSystem } from "./engine";

export interface FieldLabels {
  primary: string;
  secondary: string;
  depth: string;
  density: string;
  shapeHelp: string;
  secondaryHidden: boolean;
}

export function fieldLabels(shape: Shape, unitSystem: UnitSystem): FieldLabels {
  const lengthUnit = unitSystem === "us" ? "feet" : "meters";
  const depthUnit = unitSystem === "us" ? "inches" : "centimeters";
  const densityUnit = unitSystem === "us" ? "lb/cu ft" : "kg/cu m";
  const shared = {
    depth: `Depth (${depthUnit})`,
    density: `Density (${densityUnit})`,
  };

  if (shape === "circle") {
    return {
      ...shared,
      primary: `Diameter (${lengthUnit})`,
      secondary: `Width (${lengthUnit})`,
      shapeHelp: "Diameter is the widest distance across the circle.",
      secondaryHidden: true,
    };
  }

  if (shape === "triangle") {
    return {
      ...shared,
      primary: `Base (${lengthUnit})`,
      secondary: `Height (${lengthUnit})`,
      shapeHelp:
        "Base is one side. Height is the straight distance from that side to the opposite corner, measured square to the base.",
      secondaryHidden: false,
    };
  }

  return {
    ...shared,
    primary: `Length (${lengthUnit})`,
    secondary: `Width (${lengthUnit})`,
    shapeHelp: "Length and width are the two sides of the area you will cover.",
    secondaryHidden: false,
  };
}
