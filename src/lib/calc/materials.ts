export interface DensityPreset {
  id: string;
  name: string;
  poundsPerCubicFoot: number;
  /** Shown under the density field. */
  guidance: string;
  /** Shown in the methodology table. */
  publishedRange: string;
  /** Why the planning figure was chosen. */
  basis: string;
}

export interface BagSpec {
  id: string;
  label: string;
  cubicFeet?: number;
  pounds?: number;
}

export const gravelPresets: readonly DensityPreset[] = [
  {
    id: "pea-gravel",
    name: "Pea gravel",
    poundsPerCubicFoot: 100,
    guidance:
      "Washed, rounded stone about 3/8 inch. Loose pea gravel is commonly quoted around 93 to 104 pounds per cubic foot. 100 is the planning midpoint.",
    publishedRange: "93–104 lb/cu ft",
    basis:
      "Midpoint of the range landscape suppliers usually quote for loose pea gravel. A generic dry-gravel reference value is a little higher (105 lb/cu ft).",
  },
  {
    id: "crushed-stone",
    name: "Crushed stone",
    poundsPerCubicFoot: 105,
    guidance:
      "Angular gravel such as #57 stone. The Engineering Toolbox lists dry gravel at 105 pounds per cubic foot. Wet gravel is heavier.",
    publishedRange: "105 lb/cu ft dry; about 125 wet",
    basis:
      "Engineering Toolbox dirt-and-mud density table: gravel, dry, 105 lb/cu ft (1,680 kg/m³, their rounded metric figure).",
  },
  {
    id: "river-rock",
    name: "River rock",
    poundsPerCubicFoot: 100,
    guidance:
      "Smooth stone, often 1 to 3 inches. Larger rock has more open space between pieces, so a supplier figure is worth using when the rock is cobble-sized.",
    publishedRange: "about 93–104 lb/cu ft",
    basis:
      "Same planning band as pea gravel. Very large rock can land lighter per cubic foot because of the voids, which is why the density stays editable.",
  },
  {
    id: "crusher-run",
    name: "Crusher run",
    poundsPerCubicFoot: 110,
    guidance:
      "Dense-graded base: crushed stone plus fines that pack. Loose weight is often about 100 to 125 pounds per cubic foot. 110 is a middle planning figure.",
    publishedRange: "about 100–125 lb/cu ft",
    basis:
      "Planning midpoint for dense-graded base. It compacts more than clean crushed stone, so the allowance matters as much as the density.",
  },
  {
    id: "decomposed-granite",
    name: "Decomposed granite",
    poundsPerCubicFoot: 105,
    guidance:
      "Fine granite that firms up after it is watered and tamped. Loose weight is similar to dry gravel. Compaction can be large.",
    publishedRange: "about 100–115 lb/cu ft loose",
    basis: "Planning figure aligned with dry gravel. Finished depth after tamping is less than the loose depth you order.",
  },
  {
    id: "lava-rock",
    name: "Lava rock",
    poundsPerCubicFoot: 50,
    guidance:
      "Lightweight volcanic rock. Loose weight is often about 40 to 55 pounds per cubic foot, far below ordinary gravel.",
    publishedRange: "about 40–55 lb/cu ft",
    basis: "Midpoint of the range commonly printed for landscape lava rock. A ton covers much more ground than a ton of crushed stone.",
  },
];

export const mulchPresets: readonly DensityPreset[] = [
  {
    id: "shredded-hardwood",
    name: "Shredded hardwood",
    poundsPerCubicFoot: 22,
    guidance:
      "Bulk hardwood mulch is usually sold by the cubic yard. Loose weight often falls around 400 to 800 pounds per yard (about 15 to 30 lb/cu ft) depending on moisture and fines.",
    publishedRange: "about 15–30 lb/cu ft",
    basis:
      "Planning midpoint of the usual bulk-mulch band, about 600 pounds per cubic yard. Bark and wood refuse in published tables is often lighter, around 10 to 20 lb/cu ft.",
  },
  {
    id: "bark-nuggets",
    name: "Bark nuggets",
    poundsPerCubicFoot: 15,
    guidance:
      "Chunk bark is lighter than shredded hardwood and less likely to mat. Weight still moves with moisture.",
    publishedRange: "about 10–20 lb/cu ft",
    basis:
      "Inside the Engineering Toolbox range for bark and wood refuse (10 to 20 lb/cu ft). Volume, not weight, is how nuggets are ordered.",
  },
  {
    id: "wood-chips",
    name: "Wood chips",
    poundsPerCubicFoot: 18,
    guidance:
      "Arborist chips vary with species, leaf content, and how wet the load is. 18 pounds per cubic foot sits in the usual band.",
    publishedRange: "about 15–30 lb/cu ft",
    basis: "Planning figure inside the common chip-mulch band. Order chips by the cubic yard.",
  },
];

export const soilPresets: readonly DensityPreset[] = [
  {
    id: "screened-topsoil",
    name: "Screened topsoil",
    poundsPerCubicFoot: 80,
    guidance:
      "Loose moist topsoil is near the weight of loam. The Engineering Toolbox lists loam at 80 pounds per cubic foot and loose moist dirt at 78. A wet yard load can be heavier.",
    publishedRange: "about 76–100 lb/cu ft",
    basis:
      "Engineering Toolbox: loam 80 lb/cu ft, loose moist dirt 78 lb/cu ft, loose dry dirt 76 lb/cu ft. Wet delivered topsoil is often quoted up to about 100 lb/cu ft.",
  },
  {
    id: "garden-mix",
    name: "Garden soil blend",
    poundsPerCubicFoot: 65,
    guidance:
      "Blends cut with compost are lighter than mineral topsoil. 65 pounds per cubic foot is a planning midpoint, not a lab test of a named mix.",
    publishedRange: "about 50–80 lb/cu ft",
    basis:
      "Planning midpoint between a compost-heavy blend and mineral topsoil. Use the supplier’s weight when the mix is sold by the ton.",
  },
  {
    id: "fill-dirt",
    name: "Fill dirt",
    poundsPerCubicFoot: 76,
    guidance:
      "Loose dry fill is listed around 76 pounds per cubic foot. Fill is for raising grade. It is a poor substitute for planting soil.",
    publishedRange: "76 lb/cu ft loose dry; heavier when moist",
    basis: "Engineering Toolbox: dirt, loose dry, 76 lb/cu ft. Moist or clayey fill weighs more.",
  },
];

export const gravelBags: readonly BagSpec[] = [
  { id: "half-cu-ft", label: "0.5 cu ft bags", cubicFeet: 0.5 },
  { id: "fifty-lb", label: "50 lb bags", pounds: 50 },
];

export const mulchBags: readonly BagSpec[] = [
  { id: "two-cu-ft", label: "2 cu ft bags", cubicFeet: 2 },
  { id: "three-cu-ft", label: "3 cu ft bags", cubicFeet: 3 },
];

export const soilBags: readonly BagSpec[] = [
  { id: "one-cu-ft", label: "1 cu ft bags", cubicFeet: 1 },
  { id: "three-quarter-cu-ft", label: "0.75 cu ft bags", cubicFeet: 0.75 },
  { id: "forty-lb", label: "40 lb bags", pounds: 40 },
];

export function presetById(presets: readonly DensityPreset[], id: string): DensityPreset {
  const preset = presets.find((item) => item.id === id);
  if (!preset) throw new Error(`Unknown material preset: ${id}`);
  return preset;
}
