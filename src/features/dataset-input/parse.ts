export function parseNumbers(text: string): number[] {
  // comma is a decimal separator ("3,5"); a trailing comma ("1, 2") still parses as 1 and 2
  return text.split(/[\s;]+/).filter(Boolean).map((t) => Number(t.replace(',', '.'))).filter(Number.isFinite)
}
