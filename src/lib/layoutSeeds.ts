interface Area {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function layoutSeeds(
  area: Area,
  count: number
): { x: number; y: number }[] {
  const pad = 60;
  const innerW = area.w - pad * 2;
  const innerH = area.h - pad * 2;

  if (count === 0) return [];
  if (count === 1)
    return [{ x: area.x + area.w / 2, y: area.y + area.h / 2 + 10 }];

  const cols = Math.ceil(Math.sqrt(count * (innerW / innerH)));
  const rows = Math.ceil(count / cols);
  const positions: { x: number; y: number }[] = [];

  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x =
      area.x +
      pad +
      (cols > 1 ? (col / (cols - 1)) * innerW : innerW / 2);
    const y =
      area.y +
      pad +
      20 +
      (rows > 1 ? (row / (rows - 1)) * innerH : innerH / 2);
    positions.push({
      x: x + Math.sin(i * 2.7) * 12,
      y: y + Math.cos(i * 3.1) * 10,
    });
  }
  return positions;
}
