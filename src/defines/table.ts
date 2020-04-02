// TODO: currently this is redudant but we want to add options here at some point. We also want to
// introduce a single set of functions to define tables and indices, enums, functions, etc.
export const defineTable = <T>(tableSchema: T): T => {
  return tableSchema;
};
