export function generateRandomColor(): string {
  const r = generateRandomInteger(0, 255);
  const g = generateRandomInteger(0, 255);
  const b = generateRandomInteger(0, 255);
  return `${r},${g},${b}`;
}

function generateRandomInteger(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1));
}
