export function parsePrice(input: string): number {
  return Number(
    input
      .replace(/\./g, "")  // quita miles
      .replace(",", ".")   // decimal
  );
}