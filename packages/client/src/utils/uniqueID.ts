export function uniqueID(): string {
  return `${Math.floor(Math.random() * Date.now())}`;
}
