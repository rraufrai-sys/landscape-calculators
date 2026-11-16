export interface Tool {
  href: string;
  name: string;
  shortName: string;
  summary: string;
  detail: string;
}

export const tools: readonly Tool[] = [
  {
    href: "/gravel-calculator/",
    name: "Gravel calculator",
    shortName: "Gravel",
    summary: "Cubic yards, cubic feet, short tons, and bags.",
    detail:
      "Pea gravel, crushed stone, and river rock, with a density you can replace with the figure on your supplier’s ticket.",
  },
  {
    href: "/mulch-calculator/",
    name: "Mulch calculator",
    shortName: "Mulch",
    summary: "Cubic yards plus 2 and 3 cubic foot bags.",
    detail:
      "Bed coverage at a 2 to 4 inch depth, with bag counts for the sizes sold at US garden centers.",
  },
  {
    href: "/topsoil-calculator/",
    name: "Topsoil calculator",
    shortName: "Topsoil",
    summary: "Cubic yards, short tons, and bags of soil.",
    detail:
      "Screened topsoil, garden mix, and fill dirt for beds, raised beds, and lawn topdressing.",
  },
  {
    href: "/sod-calculator/",
    name: "Sod calculator",
    shortName: "Sod",
    summary: "Square feet, pallets, and rolls.",
    detail:
      "Order area with a waste allowance, using a pallet size and roll size you can change to match the farm.",
  },
] as const;
