export function getPointOnPath(d: string, t: number) {
  if (typeof document === "undefined") return { x: 0, y: 0 };
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", d);
  const length = path.getTotalLength();
  const p = path.getPointAtLength(length * Math.max(0, Math.min(1, t)));
  return { x: p.x, y: p.y };
}
