/** Shared with the calculator forms and the worked examples on each page. */
export const gravelExample = {
  primary: 12,
  secondary: 10,
  depthInches: 2,
  allowancePercent: 10,
  presetId: "pea-gravel",
} as const;

export const mulchExample = {
  primary: 9,
  secondary: 12,
  depthInches: 3,
  allowancePercent: 0,
  presetId: "shredded-hardwood",
} as const;

export const soilExample = {
  primary: 8,
  secondary: 4,
  depthInches: 12,
  allowancePercent: 10,
  presetId: "screened-topsoil",
} as const;

export const sodExample = {
  primary: 30,
  secondary: 15,
  allowancePercent: 5,
  sqFtPerPallet: 450,
  sqFtPerPiece: 10,
} as const;
