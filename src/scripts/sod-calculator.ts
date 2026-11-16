import {
  convertLength,
  fieldLabels,
  formatFieldNumber,
  formatNumber,
  parseDecimal,
  sodMeasureNote,
  sodOrderFromFields,
  summarizeSod,
  type Shape,
  type UnitSystem,
} from "../lib/calc";

const FIELD_NAMES = [
  "primary",
  "secondary",
  "allowance",
  "pallet",
  "piece",
  "pricePerSqFt",
  "pricePerPallet",
] as const;

const DASH = "—";

export function bindSodCalculators(root: ParentNode = document): void {
  for (const calculator of root.querySelectorAll<HTMLElement>("[data-calculator='sod']")) {
    bindOne(calculator);
  }
}

function bindOne(root: HTMLElement): void {
  const form = root instanceof HTMLFormElement ? root : root.querySelector("form");
  if (!form) return;
  const pieceName = root.dataset.pieceName || "rolls";
  let unit = readUnit(form);

  const onEdit = (event: Event) => {
    const target = event.target;
    if (
      target instanceof HTMLInputElement &&
      target.name === "unit" &&
      isUnit(target.value) &&
      target.value !== unit
    ) {
      const next = target.value;
      rewrite(input(form, "primary"), unit, next);
      rewrite(input(form, "secondary"), unit, next);
      unit = next;
    }
    unit = readUnit(form);
    applyLabels(root, form);
    render(root, form, pieceName);
  };

  form.addEventListener("input", onEdit);
  form.addEventListener("change", onEdit);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    onEdit(event);
    form.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
  });

  applyLabels(root, form);
  render(root, form, pieceName);
}

function render(root: HTMLElement, form: HTMLFormElement, pieceName: string): void {
  const result = sodOrderFromFields({
    unitSystem: readUnit(form),
    shape: readShape(form),
    primary: value(form, "primary"),
    secondary: value(form, "secondary"),
    allowancePercent: value(form, "allowance"),
    sqFtPerPallet: value(form, "pallet"),
    sqFtPerPiece: value(form, "piece"),
    pieceName,
    pricePerSqFt: value(form, "pricePerSqFt"),
    pricePerPallet: value(form, "pricePerPallet"),
  });

  clearInvalid(form);
  const summary = root.querySelector("[data-out='summary']");
  const note = root.querySelector<HTMLElement>("[data-out='pallet-note']");
  if (!result.ok) {
    summary?.classList.add("is-error");
    setText(summary, result.error);
    markInvalid(form, result.field);
    for (const key of ["order-area", "pallets", "exact-pallets", "pieces"]) {
      setText(root.querySelector(`[data-out='${key}']`), DASH);
    }
    setText(root.querySelector("[data-out='measure']"), "");
    if (note) note.hidden = true;
    setSteps(root.querySelector("[data-out='steps']"), []);
    setCosts(root, []);
    return;
  }

  summary?.classList.remove("is-error");
  setText(summary, summarizeSod(result.value));
  setText(root.querySelector("[data-out='order-area']"), formatNumber(result.value.orderedSqFt, 1));
  setText(root.querySelector("[data-out='pallets']"), formatNumber(result.value.palletsToOrder, 0));
  setText(root.querySelector("[data-out='exact-pallets']"), formatNumber(result.value.exactPallets, 2));
  setText(root.querySelector("[data-out='pieces']"), formatNumber(result.value.piecesToOrder, 0));
  setText(root.querySelector("[data-out='measure']"), sodMeasureNote(result.value));
  if (note) {
    note.hidden = result.value.partialPalletNote === null;
    if (result.value.partialPalletNote) setText(note, result.value.partialPalletNote);
  }
  setSteps(root.querySelector("[data-out='steps']"), result.value.steps);
  setCosts(root, result.value.costs.map((line) => line.text));
}

function applyLabels(root: HTMLElement, form: HTMLFormElement): void {
  const labels = fieldLabels(readShape(form), readUnit(form));
  setText(root.querySelector("[data-label='primary']"), labels.primary);
  setText(root.querySelector("[data-label='secondary']"), labels.secondary);
  setText(root.querySelector("[data-shape-help]"), labels.shapeHelp);
  const wrap = root.querySelector<HTMLElement>("[data-dimension='secondary']");
  if (wrap) wrap.hidden = labels.secondaryHidden;
  const secondary = input(form, "secondary");
  if (secondary) secondary.disabled = labels.secondaryHidden;
}

function setCosts(root: ParentNode, lines: string[]): void {
  const hint = root.querySelector<HTMLElement>("[data-out='cost-hint']");
  const list = root.querySelector<HTMLElement>("[data-out='costs']");
  if (hint) hint.hidden = lines.length > 0;
  if (!list) return;
  list.hidden = lines.length === 0;
  const current = Array.from(list.children).map((item) => item.textContent ?? "");
  if (current.length === lines.length && current.every((line, index) => line === lines[index])) return;
  list.replaceChildren(
    ...lines.map((line) => {
      const item = document.createElement("li");
      item.textContent = line;
      return item;
    }),
  );
}

function setSteps(list: HTMLOListElement | null, steps: string[]): void {
  if (!list) return;
  const current = Array.from(list.children).map((item) => item.textContent ?? "");
  if (current.length === steps.length && current.every((step, index) => step === steps[index])) return;
  list.replaceChildren(
    ...steps.map((step) => {
      const item = document.createElement("li");
      item.textContent = step;
      return item;
    }),
  );
}

function setText(node: Element | null, text: string): void {
  if (node && node.textContent !== text) node.textContent = text;
}

function clearInvalid(form: HTMLFormElement): void {
  for (const name of FIELD_NAMES) {
    const field = input(form, name);
    field?.removeAttribute("aria-invalid");
    field?.removeAttribute("aria-errormessage");
  }
}

function markInvalid(form: HTMLFormElement, field: string | undefined): void {
  if (!field) return;
  const mapped = field === "pallet" || field === "piece" ? field : field;
  const control = input(form, mapped);
  control?.setAttribute("aria-invalid", "true");
  control?.setAttribute("aria-errormessage", "calc-error");
}

function rewrite(field: HTMLInputElement | null, from: UnitSystem, to: UnitSystem): void {
  if (!field) return;
  const parsed = parseDecimal(field.value);
  if (parsed === null) return;
  field.value = formatFieldNumber(convertLength(parsed, from, to));
}

function readUnit(form: HTMLFormElement): UnitSystem {
  return value(form, "unit") === "metric" ? "metric" : "us";
}

function readShape(form: HTMLFormElement): Shape {
  const shape = value(form, "shape");
  if (shape === "circle" || shape === "triangle") return shape;
  return "rectangle";
}

function isUnit(value: string): value is UnitSystem {
  return value === "us" || value === "metric";
}

function value(form: HTMLFormElement, name: string): string {
  const element = form.elements.namedItem(name);
  if (element instanceof RadioNodeList) return element.value;
  if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement) return element.value;
  return "";
}

function input(form: HTMLFormElement, name: string): HTMLInputElement | null {
  const element = form.elements.namedItem(name);
  return element instanceof HTMLInputElement ? element : null;
}
