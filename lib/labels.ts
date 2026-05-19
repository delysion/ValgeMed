export function humanize(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  return value.replaceAll("_", " ");
}

export function dateValue(value?: Date | string | null) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 10);
}

export function dateTimeValue(value?: Date | string | null) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 16);
}

export function fmtDate(value?: Date | string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function optionize(values: readonly string[]) {
  return values.map((value) => ({ label: humanize(value), value }));
}
