export function uniqueName(prefix: string): string {
  return `${prefix} ${Date.now().toString(36)}`;
}
