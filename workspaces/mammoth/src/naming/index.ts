import { allReservedKeywords } from './all-reserved-keywords';
import { reservedKeywords } from './reserved-keywords';

export const wrapQuotes = (string: string, extended?: boolean) => {
  const isCamelCase = string.match(/[A-Z]/);
  const isReserved = reservedKeywords.has(string) || (extended && allReservedKeywords.has(string));
  const containsSpace = string.includes(` `);
  const shouldWrap = isReserved || isCamelCase || containsSpace;

  return shouldWrap ? `"${string}"` : string;
};

export const toSnakeCase = (string: string) =>
  string
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map((word) => word.toLowerCase())
    .join('_');
