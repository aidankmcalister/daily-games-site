import { Filter } from "bad-words";

const filter = new Filter();

export function cleanText(text: string): string {
  try {
    return filter.clean(text);
  } catch (error) {
    // Fallback if something goes wrong (e.g. empty string or weird input)
    return text;
  }
}

export function isProfane(text: string): boolean {
  try {
    return filter.isProfane(text);
  } catch (error) {
    return false;
  }
}
