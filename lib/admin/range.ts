export type RangeKey = "today" | "7d" | "30d" | "90d" | "custom";

export type DateRange = {
  key: RangeKey;
  from: Date;
  to: Date;
  prevFrom: Date;
  prevTo: Date;
};

export function parseRange(input: { range?: string; from?: string; to?: string }): DateRange {
  const key = (["today", "7d", "30d", "90d", "custom"] as const).includes(input.range as RangeKey)
    ? (input.range as RangeKey)
    : "30d";
  const to = endOfDay(new Date());
  if (key === "custom" && input.from && input.to) {
    const from = startOfDay(new Date(input.from));
    const customTo = endOfDay(new Date(input.to));
    const span = customTo.getTime() - from.getTime();
    return {
      key,
      from,
      to: customTo,
      prevFrom: new Date(from.getTime() - span),
      prevTo: new Date(from.getTime() - 1),
    };
  }
  const days = key === "today" ? 1 : key === "7d" ? 7 : key === "90d" ? 90 : 30;
  const from = startOfDay(new Date(to.getTime() - (days - 1) * 864e5));
  return {
    key,
    from,
    to,
    prevFrom: new Date(from.getTime() - days * 864e5),
    prevTo: new Date(from.getTime() - 1),
  };
}

export function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

export function iso(date: Date) {
  return date.toISOString();
}
