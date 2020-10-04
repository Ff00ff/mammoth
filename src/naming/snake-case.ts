export const wrapQuotes = (string: string) => (string.match(/[A-Z]/) ? `"${string}"` : string);
export const toSnakeCase = (string: string) =>
  string
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map((word) => word.toLowerCase())
    .join('_');
