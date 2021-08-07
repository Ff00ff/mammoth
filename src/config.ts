import { Uuid } from './data-types';

export interface DefaultDbConfig {
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
  // In default pg this will be changed to string soon, right?
  Date: Date;
  DateTime: Date;
  Time: string;
}

export interface DbConfig {
  Null: any;
  Int4: any;
  Int8: any;
  Float4: any;
  Float8: any;
  Numeric: any;
  Text: any;
  Date: any;
  DateTime: any;
  Time: any;
}

type GetSingleResultType<Config extends DbConfig, T> = T extends Uuid<any>
  ? string
  : T extends keyof Config
  ? Config[T]
  : T;

export type GetResultType<Config extends DbConfig, T> = T extends Array<any>
  ? GetSingleResultType<Config, T[number]>[]
  : GetSingleResultType<Config, T>;
