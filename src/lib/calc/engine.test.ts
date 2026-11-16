import { describe, expect, it } from "vitest";
import {
  CENTIMETERS_PER_INCH,
  convertDepth,
  convertLength,
  CUBIC_FEET_PER_CUBIC_YARD,
  cubicYardsForArea,
  densityToDisplay,
  formatFieldNumber,
  gravelBags,
  gravelPresets,
  KG_PER_M3_PER_LB_PER_FT3,
  kilogramsPerCubicMeter,
  METERS_PER_FOOT,
  mulchBags,
  mulchPresets,
  orderCount,
  parseDecimal,
  POUNDS_PER_SHORT_TON,
  presetById,
  soilBags,
  soilPresets,
  sodOrderFromFields,
  sqFtPerCubicYard,
  SQUARE_FEET_PER_CUBIC_YARD_AT_ONE_INCH,
  summarizeSod,
  summarizeVolume,
  tonsPerCubicYard,
  unwrap,
  volumeOrderFromFields,
} from "./index";
import { fieldLabels } from "./labels";

const emptyPrices = {
  pricePerCubicYard: "",
  pricePerShortTon: "",
  pricePerBag: "",
  priceBagId: "half-cu-ft",
};

describe("constants and coverage", () => {
  it("treats a cubic yard as 27 cubic feet and a short ton as 2,000 pounds", () => {
    expect(CUBIC_FEET_PER_CUBIC_YARD).toBe(27);
    expect(POUNDS_PER_SHORT_TON).toBe(2000);
    expect(METERS_PER_FOOT).toBe(0.3048);
    expect(CENTIMETERS_PER_INCH).toBe(2.54);
  });

  it("covers 324 square feet with one cubic yard at one inch", () => {
    expect(SQUARE_FEET_PER_CUBIC_YARD_AT_ONE_INCH).toBe(324);
    expect(sqFtPerCubicYard(1)).toBe(324);
    expect(sqFtPerCubicYard(2)).toBe(162);
    expect(sqFtPerCubicYard(3)).toBe(108);
    expect(sqFtPerCubicYard(4)).toBe(81);
    expect(sqFtPerCubicYard(6)).toBe(54);
  });

  it("scales area, depth, and allowance into cubic yards", () => {
    expect(cubicYardsForArea(100, 3, 0)).toBeCloseTo(100 / 108, 10);
    expect(cubicYardsForArea(120, 2, 0.1)).toBeCloseTo((20 / 27) * 1.1, 10);
  });

  it("converts 100 lb/cu ft to 1.35 short tons per cubic yard", () => {
    expect(tonsPerCubicYard(100)).toBeCloseTo(1.35, 10);
    expect(tonsPerCubicYard(105)).toBeCloseTo(1.4175, 10);
    expect(kilogramsPerCubicMeter(105)).toBeCloseTo(105 * KG_PER_M3_PER_LB_PER_FT3, 8);
  });
});

describe("parsing and rounding", () => {
  it("parses plain decimals and thousands separators", () => {
    expect(parseDecimal(" 3 ")).toBe(3);
    expect(parseDecimal(".5")).toBe(0.5);
    expect(parseDecimal("5.")).toBe(5);
    expect(parseDecimal("1,200.5")).toBe(1200.5);
    expect(parseDecimal("")).toBeNull();
    expect(parseDecimal("10ft")).toBeNull();
    expect(parseDecimal("1e2")).toBeNull();
  });

  it("rounds order counts up without bumping exact integers", () => {
    expect(orderCount(44)).toBe(44);
    expect(orderCount(9)).toBe(9);
    expect(orderCount(36.666666)).toBe(37);
    expect(orderCount(13.5)).toBe(14);
    expect(orderCount(0)).toBe(0);
    expect(orderCount(-2)).toBe(0);
  });

  it("round-trips length and depth through the field format", () => {
    const meters = convertLength(12, "us", "metric");
    expect(meters).toBeCloseTo(3.6576, 4);
    const back = convertLength(Number(formatFieldNumber(meters)), "metric", "us");
    expect(back).toBeCloseTo(12, 6);

    const centimeters = convertDepth(2, "us", "metric");
    expect(centimeters).toBeCloseTo(5.08, 8);
    expect(convertDepth(Number(formatFieldNumber(centimeters)), "metric", "us")).toBeCloseTo(2, 8);
  });
});

describe("gravel volume", () => {
  const order = unwrap(
    volumeOrderFromFields({
      unitSystem: "us",
      shape: "rectangle",
      primary: "12",
      secondary: "10",
      depth: "2",
      density: "100",
      densityUnit: "lb-per-cu-ft",
      allowancePercent: "10",
      bags: gravelBags,
      ...emptyPrices,
    }),
  );

  it("orders 22 cubic feet and 1.1 short tons for a 12 by 10 foot area at 2 inches", () => {
    expect(order.areaSqFt).toBeCloseTo(120, 8);
    expect(order.netCubicFeet).toBeCloseTo(20, 8);
    expect(order.netCubicYards).toBeCloseTo(20 / 27, 8);
    expect(order.orderedCubicFeet).toBeCloseTo(22, 8);
    expect(order.orderedCubicYards).toBeCloseTo(22 / 27, 8);
    expect(order.orderedShortTons).toBeCloseTo(1.1, 8);
    expect(order.orderedPounds).toBeCloseTo(2200, 6);
    expect(order.orderedMetricTonnes).toBeCloseTo((2200 * 0.45359237) / 1000, 8);
    expect(order.bags.find((bag) => bag.id === "half-cu-ft")?.count).toBe(44);
    expect(order.bags.find((bag) => bag.id === "fifty-lb")?.count).toBe(44);
  });

  it("shows the working in the order a person can check", () => {
    expect(order.steps).toEqual([
      "Area = 12 ft × 10 ft = 120 sq ft.",
      "Depth = 2 in ÷ 12 = 0.1667 ft.",
      "Net volume = 120 sq ft × (2 ÷ 12) ft = 20 cu ft (0.74 cu yd).",
      "Allowance = 10%, so order volume = 20 cu ft × 1.1 = 22 cu ft (0.81 cu yd).",
      "Density = 100 lb/cu ft (1,602 kg/cu m), or 1.35 short tons per cubic yard.",
      "Weight = 22 cu ft × 100 lb/cu ft ÷ 2,000 = 1.1 short tons (0.998 metric tonnes).",
      "0.5 cu ft bags: 22 ÷ 0.5 = 44 bags.",
      "50 lb bags: 2,200 lb ÷ 50 lb = 44 bags.",
      "Metric equivalent: 0.623 cubic meters.",
    ]);
    expect(summarizeVolume(order, "Pea gravel")).toBe(
      "About 0.81 cubic yards of pea gravel: 22 cubic feet, or 1.1 short tons.",
    );
  });

  it("prices a yard, a ton, and a bag as separate estimates", () => {
    const priced = unwrap(
      volumeOrderFromFields({
        unitSystem: "us",
        shape: "rectangle",
        primary: "12",
        secondary: "10",
        depth: "2",
        density: "100",
        densityUnit: "lb-per-cu-ft",
        allowancePercent: "10",
        bags: gravelBags,
        pricePerCubicYard: "55",
        pricePerShortTon: "40",
        pricePerBag: "5",
        priceBagId: "half-cu-ft",
      }),
    );
    expect(priced.costs.map((line) => line.text)).toEqual([
      "At $55.00 per cubic yard for 0.81 cubic yards, the material estimate is $44.81.",
      "At $40.00 per short ton for 1.1 short tons, the material estimate is $44.00.",
      "At $5.00 each for 44 0.5 cu ft bags, the material estimate is $220.00.",
    ]);
  });
});

describe("shapes, metric, mulch, and soil", () => {
  it("computes a circle and a triangle from US dimensions", () => {
    const circle = unwrap(
      volumeOrderFromFields({
        unitSystem: "us",
        shape: "circle",
        primary: "10",
        secondary: "",
        depth: "2",
        density: "105",
        densityUnit: "lb-per-cu-ft",
        allowancePercent: "0",
        bags: [],
        ...emptyPrices,
      }),
    );
    expect(circle.areaSqFt).toBeCloseTo(Math.PI * 25, 8);
    expect(circle.netCubicFeet).toBeCloseTo((Math.PI * 25 * 2) / 12, 8);
    expect(circle.steps[0]).toBe("Area = π × (10 ft ÷ 2)² = 78.54 sq ft.");

    const triangle = unwrap(
      volumeOrderFromFields({
        unitSystem: "us",
        shape: "triangle",
        primary: "10",
        secondary: "8",
        depth: "3",
        density: "100",
        densityUnit: "lb-per-cu-ft",
        allowancePercent: "0",
        bags: [],
        ...emptyPrices,
      }),
    );
    expect(triangle.areaSqFt).toBeCloseTo(40, 8);
    expect(triangle.netCubicFeet).toBeCloseTo(10, 8);
  });

  it("turns 1 m × 1 m × 10 cm into 0.1 cubic meters", () => {
    const kilograms = densityToDisplay(100, "metric");
    const order = unwrap(
      volumeOrderFromFields({
        unitSystem: "metric",
        shape: "rectangle",
        primary: "1",
        secondary: "1",
        depth: "10",
        density: String(kilograms),
        densityUnit: "kg-per-cu-m",
        allowancePercent: "0",
        bags: gravelBags,
        ...emptyPrices,
      }),
    );
    expect(order.netCubicMeters).toBeCloseTo(0.1, 8);
    expect(order.poundsPerCubicFoot).toBeCloseTo(100, 6);
    expect(order.steps.some((step) => step.includes("0.1 cu m"))).toBe(true);
  });

  it("makes a 9 by 12 foot bed at 3 inches exactly one cubic yard of mulch", () => {
    const order = unwrap(
      volumeOrderFromFields({
        unitSystem: "us",
        shape: "rectangle",
        primary: "9",
        secondary: "12",
        depth: "3",
        density: "22",
        densityUnit: "lb-per-cu-ft",
        allowancePercent: "0",
        bags: mulchBags,
        ...emptyPrices,
      }),
    );
    expect(order.netCubicFeet).toBeCloseTo(27, 8);
    expect(order.netCubicYards).toBeCloseTo(1, 8);
    expect(order.bags.find((bag) => bag.id === "two-cu-ft")).toMatchObject({ exact: 13.5, count: 14 });
    expect(order.bags.find((bag) => bag.id === "three-cu-ft")).toMatchObject({ exact: 9, count: 9 });
  });

  it("counts soil by the cubic foot and by the 40 pound bag", () => {
    const order = unwrap(
      volumeOrderFromFields({
        unitSystem: "us",
        shape: "rectangle",
        primary: "8",
        secondary: "4",
        depth: "12",
        density: "80",
        densityUnit: "lb-per-cu-ft",
        allowancePercent: "0",
        bags: soilBags,
        ...emptyPrices,
      }),
    );
    expect(order.netCubicFeet).toBeCloseTo(32, 8);
    expect(order.orderedShortTons).toBeCloseTo((32 * 80) / 2000, 8);
    expect(order.bags.find((bag) => bag.id === "one-cu-ft")?.count).toBe(32);
    expect(order.bags.find((bag) => bag.id === "three-quarter-cu-ft")?.count).toBe(43);
    expect(order.bags.find((bag) => bag.id === "forty-lb")?.count).toBe(64);
  });
});

describe("sod", () => {
  it("rounds a 450 square foot lawn plus 5 percent up to 2 pallets and 48 rolls", () => {
    const order = unwrap(
      sodOrderFromFields({
        unitSystem: "us",
        shape: "rectangle",
        primary: "30",
        secondary: "15",
        allowancePercent: "5",
        sqFtPerPallet: "450",
        sqFtPerPiece: "10",
        pieceName: "rolls",
        pricePerSqFt: "0.50",
        pricePerPallet: "",
      }),
    );
    expect(order.areaSqFt).toBeCloseTo(450, 8);
    expect(order.areaSqYd).toBeCloseTo(50, 8);
    expect(order.orderedSqFt).toBeCloseTo(472.5, 8);
    expect(order.exactPallets).toBeCloseTo(1.05, 8);
    expect(order.palletsToOrder).toBe(2);
    expect(order.exactPieces).toBeCloseTo(47.25, 8);
    expect(order.piecesToOrder).toBe(48);
    expect(order.partialPalletNote).toMatch(/5% full/);
    expect(summarizeSod(order)).toBe(
      "About 472.5 square feet of sod with a 5% allowance. That is 1.05 pallets at 450 sq ft (2 to order) and 48 rolls at 10 sq ft.",
    );
    expect(order.costs[0]?.text).toContain("$236.25");
  });

  it("keeps an exact pallet on the nose when there is no allowance", () => {
    const order = unwrap(
      sodOrderFromFields({
        unitSystem: "us",
        shape: "rectangle",
        primary: "30",
        secondary: "15",
        allowancePercent: "0",
        sqFtPerPallet: "450",
        sqFtPerPiece: "10",
        pieceName: "rolls",
        pricePerSqFt: "",
        pricePerPallet: "280",
      }),
    );
    expect(order.palletsToOrder).toBe(1);
    expect(order.piecesToOrder).toBe(45);
    expect(order.partialPalletNote).toBeNull();
    expect(summarizeSod(order)).toContain("1 pallet at 450 sq ft");
    expect(order.costs[0]?.text).toContain("$280.00");
  });
});

describe("validation", () => {
  it("names the missing field", () => {
    const missing = volumeOrderFromFields({
      unitSystem: "us",
      shape: "rectangle",
      primary: "",
      secondary: "10",
      depth: "2",
      density: "100",
      densityUnit: "lb-per-cu-ft",
      allowancePercent: "10",
      bags: [],
      ...emptyPrices,
    });
    expect(missing.ok).toBe(false);
    if (!missing.ok) expect(missing.field).toBe("primary");
  });

  it("rejects a negative depth, a bad allowance, and a bad price", () => {
    const negative = unwrapError({
      unitSystem: "us",
      shape: "rectangle",
      primary: "10",
      secondary: "10",
      depth: "-1",
      density: "100",
      densityUnit: "lb-per-cu-ft",
      allowancePercent: "0",
      bags: [],
      ...emptyPrices,
    });
    expect(negative.field).toBe("depth");

    const allowance = unwrapError({
      unitSystem: "us",
      shape: "rectangle",
      primary: "10",
      secondary: "10",
      depth: "2",
      density: "100",
      densityUnit: "lb-per-cu-ft",
      allowancePercent: "150",
      bags: [],
      ...emptyPrices,
    });
    expect(allowance.field).toBe("allowance");

    const price = unwrapError({
      unitSystem: "us",
      shape: "rectangle",
      primary: "10",
      secondary: "10",
      depth: "2",
      density: "100",
      densityUnit: "lb-per-cu-ft",
      allowancePercent: "0",
      bags: gravelBags,
      pricePerCubicYard: "-5",
      pricePerShortTon: "",
      pricePerBag: "",
      priceBagId: "",
    });
    expect(price.field).toBe("pricePerCubicYard");
  });
});

describe("presets and labels", () => {
  it("keeps the published planning densities", () => {
    expect(presetById(gravelPresets, "pea-gravel").poundsPerCubicFoot).toBe(100);
    expect(presetById(gravelPresets, "crushed-stone").poundsPerCubicFoot).toBe(105);
    expect(presetById(gravelPresets, "river-rock").poundsPerCubicFoot).toBe(100);
    expect(presetById(mulchPresets, "shredded-hardwood").poundsPerCubicFoot).toBe(22);
    expect(presetById(soilPresets, "screened-topsoil").poundsPerCubicFoot).toBe(80);
    expect(presetById(soilPresets, "fill-dirt").poundsPerCubicFoot).toBe(76);
    for (const preset of [...gravelPresets, ...mulchPresets, ...soilPresets]) {
      expect(preset.poundsPerCubicFoot).toBeGreaterThan(0);
      expect(preset.basis.length).toBeGreaterThan(20);
      expect(preset.publishedRange.length).toBeGreaterThan(3);
    }
  });

  it("renames the fields for a circle measured in centimeters", () => {
    const labels = fieldLabels("circle", "metric");
    expect(labels.primary).toBe("Diameter (meters)");
    expect(labels.depth).toBe("Depth (centimeters)");
    expect(labels.density).toBe("Density (kg/cu m)");
    expect(labels.secondaryHidden).toBe(true);
    expect(fieldLabels("triangle", "us").secondary).toBe("Height (feet)");
  });
});

function unwrapError(fields: Parameters<typeof volumeOrderFromFields>[0]) {
  const result = volumeOrderFromFields(fields);
  if (result.ok) throw new Error("expected a failure");
  return result;
}
