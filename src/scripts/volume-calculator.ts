import {
  allowanceNote,
  convertDepth,
  convertLength,
  densityFromDisplay,
  densityToDisplay,
  fieldLabels,
  formatFieldNumber,
  formatNumber,
  parseDecimal,
  summarizeVolume,
  volumeOrderFromFields,
  type BagSpec,
  type Shape,
  type UnitSystem,
} from "../lib/calc";

interface PresetConfig {
  id: string;
  name: string;
  poundsPerCubicFoot: number;
  guidance: string;
}

interface CalculatorConfig {
  presets: PresetConfig[];
  bags: BagSpec[];
}

const FIELD_NAMES = [
  "primary",
  "secondary",
  "depth",
  "density",
  "allowance",
  "pricePerCubicYard",
  "pricePerShortTon",
  "pricePerBag",
] as const;

const DASH = "—";

export function bindVolumeCalculators(root: ParentNode = document): void {
  for (const calculator of root.querySelectorAll<HTMLElement>("[data-calculator='volume']")) {
    bindOne(calculator);
  }
}

function bindOne(root: HTMLElement): void {
  const form = root instanceof HTMLFormElement ? root : root.querySelector("form");
  if (!form) return;
  const config = readConfig(root);
  let unit = readUnit(form);
  const densityInput = input(form, "density");
  let densityLb = readDensityPounds(densityInput, unit);

  const onEdit = (event: Event) => {
    const target = event.target;
    if (
      target instanceof HTMLInputElement &&
      target.name === "unit" &&
      isUnit(target.value) &&
      target.value !== unit
    ) {
      const next = target.value;
      rewrite(input(form, "primary"), unit, next, convertLength);
      rewrite(input(form, "secondary"), unit, next, convertLength);
      rewrite(input(form, "depth"), unit, next, convertDepth);
      unit = next;
      writeDensity(densityInput, densityLb, unit);
    }
    if (target instanceof HTMLSelectElement && target.name === "preset") {
      const preset = config.presets.find((item) => item.id === target.value);
      if (preset) {
        densityLb = preset.poundsPerCubicFoot;
        writeDensity(densityInput, densityLb, unit);
      }
    }
    if (target instanceof HTMLInputElement && target.name === "density") {
      const parsed = parseDecimal(target.value);
      if (parsed !== null && parsed > 0) densityLb = densityFromDisplay(parsed, unit);
    }
    unit = readUnit(form);
    applyLabels(root, form);
    applyGuidance(root, form, config, densityLb);
    render(root, form, config);
  };

  form.addEventListener("input", onEdit);
  form.addEventListener("change", onEdit);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    onEdit(event);
    const invalid = form.querySelector<HTMLElement>("[aria-invalid='true']");
    invalid?.focus();
  });

  applyLabels(root, form);
  applyGuidance(root, form, config, densityLb);
  render(root, form, config);
}

function render(root: HTMLElement, form: HTMLFormElement, config: CalculatorConfig): void {
  const unit = readUnit(form);
  const result = volumeOrderFromFields({
    unitSystem: unit,
    shape: readShape(form),
    primary: value(form, "primary"),
    secondary: value(form, "secondary"),
    depth: value(form, "depth"),
    density: value(form, "density"),
    densityUnit: unit === "metric" ? "kg-per-cu-m" : "lb-per-cu-ft",
    allowancePercent: value(form, "allowance"),
    pricePerCubicYard: value(form, "pricePerCubicYard"),
    pricePerShortTon: value(form, "pricePerShortTon"),
    pricePerBag: value(form, "pricePerBag"),
    priceBagId: value(form, "priceBagId"),
    bags: config.bags,
  });

  clearInvalid(form);
  const summary = root.querySelector("[data-out='summary']");
  if (!result.ok) {
    summary?.classList.add("is-error");
    setText(summary, result.error);
    markInvalid(form, result.field);
    for (const key of ["yards", "feet", "tons", "meters", "tonnes", "area"]) {
      setText(root.querySelector(`[data-out='${key}']`), DASH);
    }
    for (const bag of config.bags) setText(root.querySelector(`[data-bag-id='${bag.id}']`), DASH);
    setText(root.querySelector("[data-out='allowance']"), "");
    setSteps(root.querySelector("[data-out='steps']"), []);
    setCosts(root, []);
    return;
  }

  summary?.classList.remove("is-error");
  const preset = selectedPreset(form, config);
  setText(summary, summarizeVolume(result.value, preset?.name ?? "material"));
  setNum(root, "yards", result.value.orderedCubicYards, 2);
  setNum(root, "feet", result.value.orderedCubicFeet, 2);
  setNum(root, "tons", result.value.orderedShortTons, 2);
  setNum(root, "meters", result.value.orderedCubicMeters, 3);
  setNum(root, "tonnes", result.value.orderedMetricTonnes, 3);
  setNum(root, "area", result.value.areaSqFt, 1);
  setText(root.querySelector("[data-out='allowance']"), allowanceNote(result.value));
  for (const bag of result.value.bags) {
    setText(root.querySelector(`[data-bag-id='${bag.id}']`), formatNumber(bag.count, 0));
  }
  setSteps(root.querySelector("[data-out='steps']"), result.value.steps);
  setCosts(root, result.value.costs.map((line) => line.text));
}

function applyLabels(root: HTMLElement, form: HTMLFormElement): void {
  const labels = fieldLabels(readShape(form), readUnit(form));
  setText(root.querySelector("[data-label='primary']"), labels.primary);
  setText(root.querySelector("[data-label='secondary']"), labels.secondary);
  setText(root.querySelector("[data-label='depth']"), labels.depth);
  setText(root.querySelector("[data-label='density']"), labels.density);
  setText(root.querySelector("[data-shape-help]"), labels.shapeHelp);
  const wrap = root.querySelector<HTMLElement>("[data-dimension='secondary']");
  if (wrap) wrap.hidden = labels.secondaryHidden;
  const secondary = input(form, "secondary");
  if (secondary) secondary.disabled = labels.secondaryHidden;
}

function applyGuidance(
  root: HTMLElement,
  form: HTMLFormElement,
  config: CalculatorConfig,
  densityLb: number,
): void {
  const preset = selectedPreset(form, config);
  if (!preset) return;
  setText(root.querySelector("[data-preset-guidance]"), preset.guidance);
  const custom = root.querySelector<HTMLElement>("[data-density-custom]");
  if (!custom) return;
  const edited = Math.abs(densityLb - preset.poundsPerCubicFoot) > 0.5;
  custom.hidden = !edited;
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

function setNum(root: ParentNode, key: string, value: number, digits: number): void {
  setText(root.querySelector(`[data-out='${key}']`), formatNumber(value, digits));
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

function markInvalid(form: HTMLFormElement, field?: string): void {
  if (!field) return;
  const control = input(form, field);
  control?.setAttribute("aria-invalid", "true");
  control?.setAttribute("aria-errormessage", "calc-error");
}

function readConfig(root: HTMLElement): CalculatorConfig {
  const raw = root.dataset.config;
  if (!raw) throw new Error("Calculator config is missing.");
  return JSON.parse(raw) as CalculatorConfig;
}

function selectedPreset(form: HTMLFormElement, config: CalculatorConfig): PresetConfig | undefined {
  return config.presets.find((preset) => preset.id === value(form, "preset"));
}

function readDensityPounds(field: HTMLInputElement | null, unit: UnitSystem): number {
  const parsed = parseDecimal(field?.value ?? "");
  if (parsed === null || parsed <= 0) return 0;
  return densityFromDisplay(parsed, unit);
}

function writeDensity(field: HTMLInputElement | null, pounds: number, unit: UnitSystem): void {
  if (!field) return;
  field.value = formatFieldNumber(densityToDisplay(pounds, unit));
}

function rewrite(
  field: HTMLInputElement | null,
  from: UnitSystem,
  to: UnitSystem,
  convert: (value: number, from: UnitSystem, to: UnitSystem) => number,
): void {
  if (!field) return;
  const parsed = parseDecimal(field.value);
  if (parsed === null) return;
  field.value = formatFieldNumber(convert(parsed, from, to));
}

function readUnit(form: HTMLFormElement): UnitSystem {
  return radioValue(form, "unit") === "metric" ? "metric" : "us";
}

function readShape(form: HTMLFormElement): Shape {
  const shape = radioValue(form, "shape");
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

function radioValue(form: HTMLFormElement, name: string): string {
  return value(form, name);
}

function input(form: HTMLFormElement, name: string): HTMLInputElement | null {
  const element = form.elements.namedItem(name);
  return element instanceof HTMLInputElement ? element : null;
}
