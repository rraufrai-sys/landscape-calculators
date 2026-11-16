import type { BagSpec } from "./materials";

export type Shape = "rectangle" | "circle" | "triangle";
export type UnitSystem = "us" | "metric";

/** International foot, exactly. */
export const METERS_PER_FOOT = 0.3048;
/** International inch, exactly. */
export const CENTIMETERS_PER_INCH = 2.54;
/** Avoirdupois pound, exactly, in kilograms. */
export const KILOGRAMS_PER_POUND = 0.45359237;
export const CUBIC_FEET_PER_CUBIC_YARD = 27;
export const POUNDS_PER_SHORT_TON = 2000;
/** Square feet covered by 1 cubic yard spread 1 inch deep: 27 × 12. */
export const SQUARE_FEET_PER_CUBIC_YARD_AT_ONE_INCH = 324;
export const KG_PER_M3_PER_LB_PER_FT3 = KILOGRAMS_PER_POUND / METERS_PER_FOOT ** 3;

const SHAPES: readonly Shape[] = ["rectangle", "circle", "triangle"];
const UNIT_SYSTEMS: readonly UnitSystem[] = ["us", "metric"];

export interface CalcFailure {
  ok: false;
  error: string;
  field?: string;
}

export interface CalcSuccess<T> {
  ok: true;
  value: T;
}

export type Result<T> = CalcSuccess<T> | CalcFailure;

export function fail(error: string, field?: string): CalcFailure {
  return field ? { ok: false, error, field } : { ok: false, error };
}

export function unwrap<T>(result: Result<T>): T {
  if (!result.ok) throw new Error(result.error);
  return result.value;
}

export interface VolumeInput {
  shape: Shape;
  unitSystem: UnitSystem;
  /** Rectangle length, circle diameter, or triangle base. Feet or meters. */
  primary: number;
  /** Rectangle width or triangle height. Feet or meters. Ignored for a circle. */
  secondary?: number;
  /** Inches in US mode, centimeters in metric mode. */
  depth: number;
  poundsPerCubicFoot: number;
  /** Extra fraction for waste, compaction, or settling. 0.1 means 10 percent. */
  allowance: number;
  bags: readonly BagSpec[];
  pricePerCubicYard?: number;
  pricePerShortTon?: number;
  pricePerBag?: number;
  priceBagId?: string;
}

export interface BagResult {
  id: string;
  label: string;
  exact: number;
  count: number;
}

export interface CostLine {
  id: string;
  text: string;
}

export interface VolumeOrder {
  unitSystem: UnitSystem;
  shape: Shape;
  areaSqFt: number;
  areaSqM: number;
  depthInches: number;
  depthCentimeters: number;
  netCubicFeet: number;
  netCubicYards: number;
  netCubicMeters: number;
  allowance: number;
  orderedCubicFeet: number;
  orderedCubicYards: number;
  orderedCubicMeters: number;
  poundsPerCubicFoot: number;
  kilogramsPerCubicMeter: number;
  tonsPerCubicYard: number;
  orderedPounds: number;
  orderedShortTons: number;
  orderedMetricTonnes: number;
  bags: BagResult[];
  costs: CostLine[];
  steps: string[];
}

export interface VolumeFields {
  unitSystem: string;
  shape: string;
  primary: string;
  secondary: string;
  depth: string;
  density: string;
  densityUnit: "lb-per-cu-ft" | "kg-per-cu-m";
  allowancePercent: string;
  pricePerCubicYard: string;
  pricePerShortTon: string;
  pricePerBag: string;
  priceBagId: string;
  bags: readonly BagSpec[];
}

export interface SodInput {
  shape: Shape;
  unitSystem: UnitSystem;
  primary: number;
  secondary?: number;
  allowance: number;
  sqFtPerPallet: number;
  sqFtPerPiece: number;
  /** Noun used in the working, such as "rolls". */
  pieceName?: string;
  pricePerSqFt?: number;
  pricePerPallet?: number;
}

export interface SodOrder {
  unitSystem: UnitSystem;
  shape: Shape;
  areaSqFt: number;
  areaSqYd: number;
  areaSqM: number;
  allowance: number;
  orderedSqFt: number;
  sqFtPerPallet: number;
  sqFtPerPiece: number;
  pieceName: string;
  exactPallets: number;
  palletsToOrder: number;
  exactPieces: number;
  piecesToOrder: number;
  costs: CostLine[];
  steps: string[];
  partialPalletNote: string | null;
}

export interface SodFields {
  unitSystem: string;
  shape: string;
  primary: string;
  secondary: string;
  allowancePercent: string;
  sqFtPerPallet: string;
  sqFtPerPiece: string;
  pieceName: string;
  pricePerSqFt: string;
  pricePerPallet: string;
}

export function formatNumber(value: number, maximumFractionDigits = 2): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Whole bags, pallets, or rolls. Values that are already integers stay put. */
export function orderCount(exact: number): number {
  if (!Number.isFinite(exact) || exact <= 0) return 0;
  const scaled = Math.round(exact * 1_000_000) / 1_000_000;
  if (scaled <= 0) return 0;
  return Math.ceil(scaled - 1e-9);
}

export function parseDecimal(raw: string): number | null {
  const trimmed = raw.trim().replace(/,/g, "");
  if (trimmed === "") return null;
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(trimmed)) return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

export function formatFieldNumber(value: number): string {
  const rounded = Math.round((value + Number.EPSILON) * 10_000) / 10_000;
  return String(rounded);
}

export function tonsPerCubicYard(poundsPerCubicFoot: number): number {
  return (poundsPerCubicFoot * CUBIC_FEET_PER_CUBIC_YARD) / POUNDS_PER_SHORT_TON;
}

export function kilogramsPerCubicMeter(poundsPerCubicFoot: number): number {
  return poundsPerCubicFoot * KG_PER_M3_PER_LB_PER_FT3;
}

export function convertLength(value: number, from: UnitSystem, to: UnitSystem): number {
  if (from === to) return value;
  return from === "us" ? value * METERS_PER_FOOT : value / METERS_PER_FOOT;
}

export function convertDepth(value: number, from: UnitSystem, to: UnitSystem): number {
  if (from === to) return value;
  return from === "us" ? value * CENTIMETERS_PER_INCH : value / CENTIMETERS_PER_INCH;
}

export function densityToDisplay(poundsPerCubicFoot: number, unitSystem: UnitSystem): number {
  return unitSystem === "us"
    ? poundsPerCubicFoot
    : kilogramsPerCubicMeter(poundsPerCubicFoot);
}

export function densityFromDisplay(value: number, unitSystem: UnitSystem): number {
  return unitSystem === "us" ? value : value / KG_PER_M3_PER_LB_PER_FT3;
}

export function sqFtPerCubicYard(depthInches: number): number {
  if (!Number.isFinite(depthInches) || depthInches <= 0) {
    throw new Error("Depth must be a positive number of inches.");
  }
  return SQUARE_FEET_PER_CUBIC_YARD_AT_ONE_INCH / depthInches;
}

export function cubicYardsForArea(
  squareFeet: number,
  depthInches: number,
  allowance = 0,
): number {
  const net = (squareFeet * (depthInches / 12)) / CUBIC_FEET_PER_CUBIC_YARD;
  return net * (1 + allowance);
}

export function summarizeVolume(order: VolumeOrder, materialName: string): string {
  const name = materialName.charAt(0).toLowerCase() + materialName.slice(1);
  if (order.unitSystem === "metric") {
    return `About ${formatNumber(order.orderedCubicMeters, 2)} cubic meters of ${name}: ${formatNumber(order.orderedCubicYards, 2)} cubic yards, or ${formatNumber(order.orderedShortTons, 2)} short tons.`;
  }
  return `About ${formatNumber(order.orderedCubicYards, 2)} cubic yards of ${name}: ${formatNumber(order.orderedCubicFeet, 2)} cubic feet, or ${formatNumber(order.orderedShortTons, 2)} short tons.`;
}

export function allowanceNote(order: VolumeOrder): string {
  if (order.allowance === 0) return "No waste or compaction allowance is included.";
  const percent = formatNumber(order.allowance * 100, 2);
  return `Before the ${percent}% allowance: ${formatNumber(order.netCubicYards, 2)} cubic yards (${formatNumber(order.netCubicFeet, 2)} cubic feet).`;
}

export function sodMeasureNote(order: SodOrder): string {
  const measured = `${formatNumber(order.areaSqFt, 1)} sq ft (${formatNumber(order.areaSqYd, 2)} sq yd, ${formatNumber(order.areaSqM, 2)} sq m)`;
  if (order.allowance === 0) return `Measured area: ${measured}. No waste allowance is included.`;
  return `Measured area before the ${formatNumber(order.allowance * 100, 2)}% allowance: ${measured}.`;
}

export function summarizeSod(order: SodOrder): string {
  const area = formatNumber(order.orderedSqFt, 1);
  const exactLabel = formatNumber(order.exactPallets, 2);
  const palletWord = noun(Number(exactLabel), "pallet", "pallets");
  const pieceSingular = order.pieceName.endsWith("s") ? order.pieceName.slice(0, -1) : order.pieceName;
  const pieceLabel = `${formatNumber(order.piecesToOrder, 0)} ${noun(order.piecesToOrder, pieceSingular, order.pieceName)}`;
  const palletSize = formatNumber(order.sqFtPerPallet, 0);
  const pieceSize = formatNumber(order.sqFtPerPiece, 2);
  const counts = `That is ${exactLabel} ${palletWord} at ${palletSize} sq ft (${formatNumber(order.palletsToOrder, 0)} to order) and ${pieceLabel} at ${pieceSize} sq ft.`;
  if (order.allowance === 0) return `About ${area} square feet of sod. ${counts}`;
  const percent = formatNumber(order.allowance * 100, 2);
  return `About ${area} square feet of sod with a ${percent}% allowance. ${counts}`;
}

function isShape(value: string): value is Shape {
  return SHAPES.includes(value as Shape);
}

function isUnitSystem(value: string): value is UnitSystem {
  return UNIT_SYSTEMS.includes(value as UnitSystem);
}

function requirePositive(value: number, label: string, field: string): CalcFailure | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fail(`Enter a number for ${label}.`, field);
  }
  if (value <= 0) return fail(`Enter a ${label} greater than zero.`, field);
  return null;
}

function optionalPrice(
  value: number | undefined,
  label: string,
  field: string,
): CalcFailure | null {
  if (value === undefined) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fail(`Enter a number for ${label}, or leave it blank.`, field);
  }
  if (value < 0) return fail(`Enter a ${label} of zero or more, or leave it blank.`, field);
  return null;
}

function parseOptionalPrice(raw: string, label: string, field: string): Result<number | undefined> {
  if (raw.trim() === "") return { ok: true, value: undefined };
  const value = parseDecimal(raw);
  if (value === null) return fail(`Enter a number for ${label}, or leave it blank.`, field);
  if (value < 0) return fail(`Enter a ${label} of zero or more, or leave it blank.`, field);
  return { ok: true, value };
}

function feetFactor(unitSystem: UnitSystem): number {
  return unitSystem === "us" ? 1 : 1 / METERS_PER_FOOT;
}

function areaSquareFeet(
  shape: Shape,
  primaryFt: number,
  secondaryFt: number,
): number {
  if (shape === "circle") return Math.PI * (primaryFt / 2) ** 2;
  if (shape === "triangle") return 0.5 * primaryFt * secondaryFt;
  return primaryFt * secondaryFt;
}

function formatPounds(value: number): string {
  const nearest = Math.round(value);
  if (Math.abs(value - nearest) < 0.05) return formatNumber(nearest, 0);
  return formatNumber(value, 1);
}

function noun(count: number, singular: string, pluralWord: string): string {
  return Math.abs(count - 1) < 0.001 ? singular : pluralWord;
}

function bagSentence(
  label: string,
  exact: number,
  count: number,
  dividend: string,
  divisor: string,
): string {
  const word = noun(count, "bag", "bags");
  if (Math.abs(exact - count) < 0.001) {
    return `${label}: ${dividend} ÷ ${divisor} = ${formatNumber(count, 0)} ${word}.`;
  }
  return `${label}: ${dividend} ÷ ${divisor} = ${formatNumber(exact, 2)}, so order ${formatNumber(count, 0)} ${word}.`;
}

export function calculateVolumeOrder(input: VolumeInput): Result<VolumeOrder> {
  if (!isShape(input.shape)) return fail("Choose a rectangle, circle, or triangle.", "shape");
  if (!isUnitSystem(input.unitSystem)) return fail("Choose US customary or metric.", "unit");

  const primaryLabel =
    input.shape === "circle" ? "diameter" : input.shape === "triangle" ? "base" : "length";
  const secondaryLabel = input.shape === "triangle" ? "height" : "width";
  const primaryError = requirePositive(input.primary, primaryLabel, "primary");
  if (primaryError) return primaryError;
  if (input.shape !== "circle") {
    const secondaryError = requirePositive(input.secondary ?? Number.NaN, secondaryLabel, "secondary");
    if (secondaryError) return secondaryError;
  }
  const depthError = requirePositive(input.depth, "depth", "depth");
  if (depthError) return depthError;
  const densityError = requirePositive(input.poundsPerCubicFoot, "density", "density");
  if (densityError) return densityError;
  if (!Number.isFinite(input.allowance) || input.allowance < 0 || input.allowance > 1) {
    return fail("Enter an allowance from 0 to 100 percent.", "allowance");
  }
  for (const price of [
    optionalPrice(input.pricePerCubicYard, "price per cubic yard", "pricePerCubicYard"),
    optionalPrice(input.pricePerShortTon, "price per short ton", "pricePerShortTon"),
    optionalPrice(input.pricePerBag, "price per bag", "pricePerBag"),
  ]) {
    if (price) return price;
  }

  const factor = feetFactor(input.unitSystem);
  const primaryFt = input.primary * factor;
  const secondaryFt = (input.secondary ?? 0) * factor;
  const areaSqFt = areaSquareFeet(input.shape, primaryFt, secondaryFt);
  const depthFeet =
    input.unitSystem === "us" ? input.depth / 12 : input.depth / 100 / METERS_PER_FOOT;
  const netCubicFeet = areaSqFt * depthFeet;
  const orderedCubicFeet = netCubicFeet * (1 + input.allowance);
  const kilograms = kilogramsPerCubicMeter(input.poundsPerCubicFoot);
  const orderedPounds = orderedCubicFeet * input.poundsPerCubicFoot;
  const orderedShortTons = orderedPounds / POUNDS_PER_SHORT_TON;
  const orderedMetricTonnes = (orderedPounds * KILOGRAMS_PER_POUND) / 1000;
  const netCubicYards = netCubicFeet / CUBIC_FEET_PER_CUBIC_YARD;
  const orderedCubicYards = orderedCubicFeet / CUBIC_FEET_PER_CUBIC_YARD;
  const cubicMetersPerCubicFoot = METERS_PER_FOOT ** 3;
  const netCubicMeters = netCubicFeet * cubicMetersPerCubicFoot;
  const orderedCubicMeters = orderedCubicFeet * cubicMetersPerCubicFoot;
  const areaSqM = areaSqFt * METERS_PER_FOOT ** 2;
  const depthInches = input.unitSystem === "us" ? input.depth : input.depth / CENTIMETERS_PER_INCH;

  if (
    ![areaSqFt, netCubicFeet, orderedCubicFeet, orderedShortTons, orderedCubicMeters].every(
      Number.isFinite,
    )
  ) {
    return fail("That area is too large to calculate.", "primary");
  }

  const bags: BagResult[] = [];
  for (const bag of input.bags) {
    let exact: number;
    if (bag.cubicFeet !== undefined && bag.cubicFeet > 0) {
      exact = orderedCubicFeet / bag.cubicFeet;
    } else if (bag.pounds !== undefined && bag.pounds > 0) {
      exact = orderedPounds / bag.pounds;
    } else {
      return fail(`The ${bag.label} size needs to be greater than zero.`, "pricePerBag");
    }
    bags.push({ id: bag.id, label: bag.label, exact, count: orderCount(exact) });
  }

  const lengthUnit = input.unitSystem === "us" ? "ft" : "m";
  const primaryText = formatNumber(input.primary, 4);
  const secondaryText = formatNumber(input.secondary ?? 0, 4);
  const steps: string[] = [];
  if (input.shape === "circle") {
    const areaNative = input.unitSystem === "us" ? areaSqFt : areaSqM;
    const areaLabel = input.unitSystem === "us" ? "sq ft" : "sq m";
    steps.push(
      `Area = π × (${primaryText} ${lengthUnit} ÷ 2)² = ${formatNumber(areaNative, 2)} ${areaLabel}.`,
    );
  } else if (input.shape === "triangle") {
    const areaNative = input.unitSystem === "us" ? areaSqFt : areaSqM;
    const areaLabel = input.unitSystem === "us" ? "sq ft" : "sq m";
    steps.push(
      `Area = 1/2 × ${primaryText} ${lengthUnit} × ${secondaryText} ${lengthUnit} = ${formatNumber(areaNative, 2)} ${areaLabel}.`,
    );
  } else {
    const areaNative = input.unitSystem === "us" ? areaSqFt : areaSqM;
    const areaLabel = input.unitSystem === "us" ? "sq ft" : "sq m";
    steps.push(
      `Area = ${primaryText} ${lengthUnit} × ${secondaryText} ${lengthUnit} = ${formatNumber(areaNative, 2)} ${areaLabel}.`,
    );
  }

  if (input.unitSystem === "us") {
    steps.push(`Depth = ${formatNumber(input.depth, 4)} in ÷ 12 = ${formatNumber(depthFeet, 4)} ft.`);
    steps.push(
      `Net volume = ${formatNumber(areaSqFt, 2)} sq ft × (${formatNumber(input.depth, 4)} ÷ 12) ft = ${formatNumber(netCubicFeet, 2)} cu ft (${formatNumber(netCubicYards, 2)} cu yd).`,
    );
  } else {
    steps.push(
      `Depth = ${formatNumber(input.depth, 4)} cm ÷ 100 = ${formatNumber(input.depth / 100, 4)} m.`,
    );
    steps.push(
      `Net volume = ${formatNumber(areaSqM, 2)} sq m × (${formatNumber(input.depth, 4)} ÷ 100) m = ${formatNumber(netCubicMeters, 3)} cu m (${formatNumber(netCubicFeet, 2)} cu ft, ${formatNumber(netCubicYards, 2)} cu yd).`,
    );
  }

  const multiplier = formatNumber(1 + input.allowance, 4);
  if (input.allowance === 0) {
    steps.push(
      input.unitSystem === "us"
        ? `Allowance = 0%, so the order volume equals the net volume, ${formatNumber(netCubicFeet, 2)} cu ft (${formatNumber(netCubicYards, 2)} cu yd).`
        : `Allowance = 0%, so the order volume equals the net volume, ${formatNumber(netCubicMeters, 3)} cu m (${formatNumber(orderedCubicYards, 2)} cu yd).`,
    );
  } else if (input.unitSystem === "us") {
    steps.push(
      `Allowance = ${formatNumber(input.allowance * 100, 2)}%, so order volume = ${formatNumber(netCubicFeet, 2)} cu ft × ${multiplier} = ${formatNumber(orderedCubicFeet, 2)} cu ft (${formatNumber(orderedCubicYards, 2)} cu yd).`,
    );
  } else {
    steps.push(
      `Allowance = ${formatNumber(input.allowance * 100, 2)}%, so order volume = ${formatNumber(netCubicMeters, 3)} cu m × ${multiplier} = ${formatNumber(orderedCubicMeters, 3)} cu m (${formatNumber(orderedCubicFeet, 2)} cu ft, ${formatNumber(orderedCubicYards, 2)} cu yd).`,
    );
  }

  steps.push(
    `Density = ${formatNumber(input.poundsPerCubicFoot, 2)} lb/cu ft (${formatNumber(kilograms, 0)} kg/cu m), or ${formatNumber(tonsPerCubicYard(input.poundsPerCubicFoot), 2)} short tons per cubic yard.`,
  );

  steps.push(
    `Weight = ${formatNumber(orderedCubicFeet, 2)} cu ft × ${formatNumber(input.poundsPerCubicFoot, 2)} lb/cu ft ÷ 2,000 = ${formatNumber(orderedShortTons, 2)} short tons (${formatNumber(orderedMetricTonnes, 3)} metric tonnes).`,
  );

  for (const bag of input.bags) {
    const result = bags.find((item) => item.id === bag.id);
    if (!result) continue;
    if (bag.cubicFeet !== undefined && bag.cubicFeet > 0) {
      steps.push(
        bagSentence(
          bag.label,
          result.exact,
          result.count,
          formatNumber(orderedCubicFeet, 2),
          formatNumber(bag.cubicFeet, 2),
        ),
      );
    } else if (bag.pounds !== undefined && bag.pounds > 0) {
      steps.push(
        bagSentence(
          bag.label,
          result.exact,
          result.count,
          `${formatPounds(orderedPounds)} lb`,
          `${formatNumber(bag.pounds, 2)} lb`,
        ),
      );
    }
  }

  if (input.unitSystem === "us") {
    steps.push(`Metric equivalent: ${formatNumber(orderedCubicMeters, 3)} cubic meters.`);
  } else {
    steps.push(
      `US order units: ${formatNumber(orderedCubicYards, 2)} cubic yards and ${formatNumber(orderedCubicFeet, 2)} cubic feet.`,
    );
  }

  const costs: CostLine[] = [];
  if (input.pricePerCubicYard !== undefined) {
    const amount = roundMoney(input.pricePerCubicYard * orderedCubicYards);
    costs.push({
      id: "yard",
      text: `At ${formatUsd(input.pricePerCubicYard)} per cubic yard for ${formatNumber(orderedCubicYards, 2)} cubic yards, the material estimate is ${formatUsd(amount)}.`,
    });
  }
  if (input.pricePerShortTon !== undefined) {
    const amount = roundMoney(input.pricePerShortTon * orderedShortTons);
    costs.push({
      id: "ton",
      text: `At ${formatUsd(input.pricePerShortTon)} per short ton for ${formatNumber(orderedShortTons, 2)} short tons, the material estimate is ${formatUsd(amount)}.`,
    });
  }
  if (input.pricePerBag !== undefined) {
    const priced = bags.find((bag) => bag.id === input.priceBagId);
    if (!priced) return fail("Choose which bag size that price applies to.", "pricePerBag");
    const amount = roundMoney(input.pricePerBag * priced.count);
    costs.push({
      id: "bag",
      text: `At ${formatUsd(input.pricePerBag)} each for ${formatNumber(priced.count, 0)} ${priced.label.toLowerCase()}, the material estimate is ${formatUsd(amount)}.`,
    });
  }
  for (const line of costs) steps.push(line.text);

  return {
    ok: true,
    value: {
      unitSystem: input.unitSystem,
      shape: input.shape,
      areaSqFt,
      areaSqM,
      depthInches,
      depthCentimeters: depthInches * CENTIMETERS_PER_INCH,
      netCubicFeet,
      netCubicYards,
      netCubicMeters,
      allowance: input.allowance,
      orderedCubicFeet,
      orderedCubicYards,
      orderedCubicMeters,
      poundsPerCubicFoot: input.poundsPerCubicFoot,
      kilogramsPerCubicMeter: kilograms,
      tonsPerCubicYard: tonsPerCubicYard(input.poundsPerCubicFoot),
      orderedPounds,
      orderedShortTons,
      orderedMetricTonnes,
      bags,
      costs,
      steps: steps.filter((step) => step.length > 0),
    },
  };
}

export function volumeOrderFromFields(fields: VolumeFields): Result<VolumeOrder> {
  if (!isUnitSystem(fields.unitSystem)) return fail("Choose US customary or metric.", "unit");
  if (!isShape(fields.shape)) return fail("Choose a rectangle, circle, or triangle.", "shape");

  const primary = parseDecimal(fields.primary);
  if (primary === null) {
    const label = fields.shape === "circle" ? "diameter" : fields.shape === "triangle" ? "base" : "length";
    return fail(`Enter a ${label}.`, "primary");
  }
  let secondary: number | undefined;
  if (fields.shape !== "circle") {
    const parsed = parseDecimal(fields.secondary);
    if (parsed === null) {
      return fail(`Enter a ${fields.shape === "triangle" ? "height" : "width"}.`, "secondary");
    }
    secondary = parsed;
  }
  const depth = parseDecimal(fields.depth);
  if (depth === null) return fail("Enter a depth.", "depth");
  const densityShown = parseDecimal(fields.density);
  if (densityShown === null) return fail("Enter a density.", "density");
  const allowancePercent = parseDecimal(fields.allowancePercent);
  if (allowancePercent === null) return fail("Enter an allowance from 0 to 100 percent.", "allowance");

  const yard = parseOptionalPrice(fields.pricePerCubicYard, "price per cubic yard", "pricePerCubicYard");
  if (!yard.ok) return yard;
  const ton = parseOptionalPrice(fields.pricePerShortTon, "price per short ton", "pricePerShortTon");
  if (!ton.ok) return ton;
  const bag = parseOptionalPrice(fields.pricePerBag, "price per bag", "pricePerBag");
  if (!bag.ok) return bag;

  const densitySystem: UnitSystem = fields.densityUnit === "kg-per-cu-m" ? "metric" : "us";
  return calculateVolumeOrder({
    shape: fields.shape,
    unitSystem: fields.unitSystem,
    primary,
    secondary,
    depth,
    poundsPerCubicFoot: densityFromDisplay(densityShown, densitySystem),
    allowance: allowancePercent / 100,
    bags: fields.bags,
    pricePerCubicYard: yard.value,
    pricePerShortTon: ton.value,
    pricePerBag: bag.value,
    priceBagId: fields.priceBagId,
  });
}

function measureArea(
  shape: Shape,
  unitSystem: UnitSystem,
  primary: number,
  secondary: number | undefined,
): Result<{ areaSqFt: number; stepsPrefix: string[] }> {
  const primaryLabel = shape === "circle" ? "diameter" : shape === "triangle" ? "base" : "length";
  const primaryError = requirePositive(primary, primaryLabel, "primary");
  if (primaryError) return primaryError;
  if (shape !== "circle") {
    const secondaryError = requirePositive(
      secondary ?? Number.NaN,
      shape === "triangle" ? "height" : "width",
      "secondary",
    );
    if (secondaryError) return secondaryError;
  }
  const factor = feetFactor(unitSystem);
  const primaryFt = primary * factor;
  const secondaryFt = (secondary ?? 0) * factor;
  const areaSqFt = areaSquareFeet(shape, primaryFt, secondaryFt);
  if (!Number.isFinite(areaSqFt)) return fail("That area is too large to calculate.", "primary");

  const lengthUnit = unitSystem === "us" ? "ft" : "m";
  const areaNative = unitSystem === "us" ? areaSqFt : areaSqFt * METERS_PER_FOOT ** 2;
  const areaLabel = unitSystem === "us" ? "sq ft" : "sq m";
  const primaryText = formatNumber(primary, 4);
  const secondaryText = formatNumber(secondary ?? 0, 4);
  let areaStep: string;
  if (shape === "circle") {
    areaStep = `Area = π × (${primaryText} ${lengthUnit} ÷ 2)² = ${formatNumber(areaNative, 2)} ${areaLabel}.`;
  } else if (shape === "triangle") {
    areaStep = `Area = 1/2 × ${primaryText} ${lengthUnit} × ${secondaryText} ${lengthUnit} = ${formatNumber(areaNative, 2)} ${areaLabel}.`;
  } else {
    areaStep = `Area = ${primaryText} ${lengthUnit} × ${secondaryText} ${lengthUnit} = ${formatNumber(areaNative, 2)} ${areaLabel}.`;
  }
  return { ok: true, value: { areaSqFt, stepsPrefix: [areaStep] } };
}

export function partialPalletNote(exactPallets: number, sqFtPerPallet: number, pieceName: string): string | null {
  const whole = Math.floor(exactPallets + 1e-9);
  const fraction = exactPallets - whole;
  if (fraction < 0.02 || fraction >= 0.5) return null;
  const leftover = fraction * sqFtPerPallet;
  return `The last pallet would be about ${formatNumber(fraction * 100, 0)}% full (${formatNumber(leftover, 1)} sq ft). Ask the farm whether it sells loose ${pieceName} before paying for a whole extra pallet.`;
}

export function calculateSodOrder(input: SodInput): Result<SodOrder> {
  if (!isShape(input.shape)) return fail("Choose a rectangle, circle, or triangle.", "shape");
  if (!isUnitSystem(input.unitSystem)) return fail("Choose US customary or metric.", "unit");
  const measured = measureArea(input.shape, input.unitSystem, input.primary, input.secondary);
  if (!measured.ok) return measured;
  if (!Number.isFinite(input.allowance) || input.allowance < 0 || input.allowance > 1) {
    return fail("Enter an allowance from 0 to 100 percent.", "allowance");
  }
  const palletError = requirePositive(input.sqFtPerPallet, "pallet size", "pallet");
  if (palletError) return palletError;
  const pieceError = requirePositive(input.sqFtPerPiece, "roll size", "piece");
  if (pieceError) return pieceError;
  const areaPrice = optionalPrice(input.pricePerSqFt, "price per square foot", "pricePerSqFt");
  if (areaPrice) return areaPrice;
  const palletPrice = optionalPrice(input.pricePerPallet, "price per pallet", "pricePerPallet");
  if (palletPrice) return palletPrice;

  const pieceName = input.pieceName?.trim() || "pieces";
  const { areaSqFt } = measured.value;
  const orderedSqFt = areaSqFt * (1 + input.allowance);
  const exactPallets = orderedSqFt / input.sqFtPerPallet;
  const exactPieces = orderedSqFt / input.sqFtPerPiece;
  const palletsToOrder = orderCount(exactPallets);
  const piecesToOrder = orderCount(exactPieces);
  const areaSqYd = areaSqFt / 9;
  const areaSqM = areaSqFt * METERS_PER_FOOT ** 2;

  const steps = [...measured.value.stepsPrefix];
  if (input.unitSystem === "metric") {
    steps.push(`That is ${formatNumber(areaSqFt, 1)} sq ft (${formatNumber(areaSqYd, 2)} sq yd). US sod is sold by the square foot.`);
  } else {
    steps.push(`That is ${formatNumber(areaSqYd, 2)} sq yd.`);
  }
  if (input.allowance === 0) {
    steps.push(`Allowance = 0%, so the order area equals the measured area, ${formatNumber(orderedSqFt, 1)} sq ft.`);
  } else {
    steps.push(
      `Allowance = ${formatNumber(input.allowance * 100, 2)}%, so the order area = ${formatNumber(areaSqFt, 1)} sq ft × ${formatNumber(1 + input.allowance, 4)} = ${formatNumber(orderedSqFt, 1)} sq ft.`,
    );
  }
  const palletExact = formatNumber(exactPallets, 2);
  const palletUnit = noun(Number(palletExact), "pallet", "pallets");
  const orderUnit = noun(palletsToOrder, "pallet", "pallets");
  if (Math.abs(exactPallets - palletsToOrder) < 0.001) {
    steps.push(
      `Pallets at ${formatNumber(input.sqFtPerPallet, 2)} sq ft: ${formatNumber(orderedSqFt, 1)} ÷ ${formatNumber(input.sqFtPerPallet, 2)} = ${formatNumber(palletsToOrder, 0)} ${orderUnit}.`,
    );
  } else {
    steps.push(
      `Pallets at ${formatNumber(input.sqFtPerPallet, 2)} sq ft: ${formatNumber(orderedSqFt, 1)} ÷ ${formatNumber(input.sqFtPerPallet, 2)} = ${palletExact} ${palletUnit}, so order ${formatNumber(palletsToOrder, 0)} ${orderUnit} if the farm sells only whole pallets.`,
    );
  }
  const pieceSingular = pieceName.endsWith("s") ? pieceName.slice(0, -1) : pieceName;
  const pieceTitle = `${pieceName[0]?.toUpperCase() ?? ""}${pieceName.slice(1)}`;
  if (Math.abs(exactPieces - piecesToOrder) < 0.001) {
    steps.push(
      `${pieceTitle} at ${formatNumber(input.sqFtPerPiece, 2)} sq ft: ${formatNumber(orderedSqFt, 1)} ÷ ${formatNumber(input.sqFtPerPiece, 2)} = ${formatNumber(piecesToOrder, 0)} ${noun(piecesToOrder, pieceSingular, pieceName)}.`,
    );
  } else {
    steps.push(
      `${pieceTitle} at ${formatNumber(input.sqFtPerPiece, 2)} sq ft: ${formatNumber(orderedSqFt, 1)} ÷ ${formatNumber(input.sqFtPerPiece, 2)} = ${formatNumber(exactPieces, 2)}, so order ${formatNumber(piecesToOrder, 0)} ${noun(piecesToOrder, pieceSingular, pieceName)}.`,
    );
  }

  const costs: CostLine[] = [];
  if (input.pricePerSqFt !== undefined) {
    const amount = roundMoney(input.pricePerSqFt * orderedSqFt);
    const text = `At ${formatUsd(input.pricePerSqFt)} per square foot for ${formatNumber(orderedSqFt, 1)} sq ft, the material estimate is ${formatUsd(amount)}.`;
    costs.push({ id: "area", text });
    steps.push(text);
  }
  if (input.pricePerPallet !== undefined) {
    const amount = roundMoney(input.pricePerPallet * palletsToOrder);
    const text = `At ${formatUsd(input.pricePerPallet)} per pallet for ${formatNumber(palletsToOrder, 0)} pallets, the material estimate is ${formatUsd(amount)}.`;
    costs.push({ id: "pallet", text });
    steps.push(text);
  }

  return {
    ok: true,
    value: {
      unitSystem: input.unitSystem,
      shape: input.shape,
      areaSqFt,
      areaSqYd,
      areaSqM,
      allowance: input.allowance,
      orderedSqFt,
      sqFtPerPallet: input.sqFtPerPallet,
      sqFtPerPiece: input.sqFtPerPiece,
      pieceName,
      exactPallets,
      palletsToOrder,
      exactPieces,
      piecesToOrder,
      costs,
      steps,
      partialPalletNote: partialPalletNote(exactPallets, input.sqFtPerPallet, pieceName),
    },
  };
}

export function sodOrderFromFields(fields: SodFields): Result<SodOrder> {
  if (!isUnitSystem(fields.unitSystem)) return fail("Choose US customary or metric.", "unit");
  if (!isShape(fields.shape)) return fail("Choose a rectangle, circle, or triangle.", "shape");
  const primary = parseDecimal(fields.primary);
  if (primary === null) {
    const label = fields.shape === "circle" ? "diameter" : fields.shape === "triangle" ? "base" : "length";
    return fail(`Enter a ${label}.`, "primary");
  }
  let secondary: number | undefined;
  if (fields.shape !== "circle") {
    const parsed = parseDecimal(fields.secondary);
    if (parsed === null) {
      return fail(`Enter a ${fields.shape === "triangle" ? "height" : "width"}.`, "secondary");
    }
    secondary = parsed;
  }
  const allowancePercent = parseDecimal(fields.allowancePercent);
  if (allowancePercent === null) return fail("Enter an allowance from 0 to 100 percent.", "allowance");
  const pallet = parseDecimal(fields.sqFtPerPallet);
  if (pallet === null) return fail("Enter a pallet size.", "pallet");
  const piece = parseDecimal(fields.sqFtPerPiece);
  if (piece === null) return fail("Enter a roll size.", "piece");
  const areaPrice = parseOptionalPrice(fields.pricePerSqFt, "price per square foot", "pricePerSqFt");
  if (!areaPrice.ok) return areaPrice;
  const palletPrice = parseOptionalPrice(fields.pricePerPallet, "price per pallet", "pricePerPallet");
  if (!palletPrice.ok) return palletPrice;

  return calculateSodOrder({
    shape: fields.shape,
    unitSystem: fields.unitSystem,
    primary,
    secondary,
    allowance: allowancePercent / 100,
    sqFtPerPallet: pallet,
    sqFtPerPiece: piece,
    pieceName: fields.pieceName,
    pricePerSqFt: areaPrice.value,
    pricePerPallet: palletPrice.value,
  });
}
