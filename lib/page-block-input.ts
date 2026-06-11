export type PageBlockInput = {
  label: string;
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  sortOrder: string;
  published?: boolean;
};

export type PageBlockData = {
  label: string;
  eyebrow: string | null;
  title: string;
  body: string;
  ctaLabel: string | null;
  ctaHref: string | null;
  sortOrder: number;
  published: boolean;
};

export type PageBlockValidationResult =
  | { ok: true; data: PageBlockData }
  | { ok: false; errors: string[] };

type ValidationOptions = {
  defaultSortOrder?: number;
  defaultPublished?: boolean;
};

export function validatePageBlockInput(
  input: PageBlockInput,
  options: ValidationOptions = {}
): PageBlockValidationResult {
  const label = input.label.trim();
  const title = input.title.trim();
  const body = input.body.trim();
  const ctaHref = input.ctaHref.trim();
  const errors: string[] = [];

  if (!label) errors.push("label is required");
  if (!title) errors.push("title is required");
  if (!body) errors.push("body is required");
  if (ctaHref && !isSafeCtaHref(ctaHref)) errors.push("ctaHref must be a relative path, anchor, or HTTPS URL");

  const sortOrder = parseSortOrder(input.sortOrder, options.defaultSortOrder ?? 100);
  if (sortOrder === null) errors.push("sortOrder must be a number");

  if (errors.length || sortOrder === null) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      label,
      eyebrow: optionalText(input.eyebrow),
      title,
      body,
      ctaLabel: optionalText(input.ctaLabel),
      ctaHref: optionalText(ctaHref),
      sortOrder,
      published: input.published ?? options.defaultPublished ?? true
    }
  };
}

export function pageBlockInputFromFormData(
  formData: FormData,
  options: { suffix?: string; defaultPublished?: boolean } = {}
): PageBlockInput {
  return {
    label: formValue(formData, fieldName("label", options.suffix)),
    eyebrow: formValue(formData, fieldName("eyebrow", options.suffix)),
    title: formValue(formData, fieldName("title", options.suffix)),
    body: formValue(formData, fieldName("body", options.suffix)),
    ctaLabel: formValue(formData, fieldName("ctaLabel", options.suffix)),
    ctaHref: formValue(formData, fieldName("ctaHref", options.suffix)),
    sortOrder: formValue(formData, fieldName("sortOrder", options.suffix)),
    published: options.suffix
      ? formData.get(fieldName("published", options.suffix)) === "on"
      : options.defaultPublished
  };
}

function fieldName(name: string, suffix?: string) {
  return suffix ? `${name}:${suffix}` : name;
}

function formValue(formData: FormData, name: string) {
  return String(formData.get(name) || "");
}

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed || null;
}

function parseSortOrder(value: string, fallback: number) {
  const trimmed = value.trim();
  if (!trimmed) return fallback;

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function isSafeCtaHref(value: string) {
  if (value.startsWith("/") || value.startsWith("#")) return true;

  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}
