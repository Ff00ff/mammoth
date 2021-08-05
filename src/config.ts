// This is an empty interface which can be extended in user-land to override the types in the
// fallback db config.
export interface DefaultDbConfig {}

export interface FallbackDbConfig {
  Null: null;
  Int4: number;
  Int8: string;
  Float4: number;
  // In pg, by default, double precision / float8s are parsed through `parseFloat()` JS global
  // func. This means we lose precision. We align the types with pg and these can be altered in
  // user-land.
  Float8: number;
  Numeric: string;
  Text: string;
}

type GetSingleResultType<T> = Extract<keyof DefaultDbConfig, T> extends never
  ? T extends keyof FallbackDbConfig
    ? FallbackDbConfig[T]
    : T
  : DefaultDbConfig[Extract<keyof DefaultDbConfig, T>];

export type GetResultType<T> = T extends Array<any>
  ? GetSingleResultType<T[number]>[]
  : GetSingleResultType<T>;
