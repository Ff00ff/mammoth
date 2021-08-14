import {
  DefaultDbConfig,
  GetColumn,
  TableRow,
  arrayAgg,
  bigint,
  bootstrap,
  coalesce,
  count,
  date,
  defineTable,
  float4,
  float8,
  int4,
  int8,
  integer,
  numeric,
  raw,
  star,
  sum,
  text,
  time,
  timestampWithTimeZone,
  uuid,
} from '../../.build';

import { Expression } from '../../.build/expression';
import { Query } from '../../.build/query';
import { ResultSet } from '../../.build/result-set';

class MyType<T> {}

interface MyConfig {
  Null: null;
  Int4: MyType<'int4'>;
  Int8: MyType<'int8'>;
  Float4: MyType<'float4'>;
  Float8: MyType<'float8'>;
  Numeric: MyType<'numeric'>;
  Text: MyType<'text'>;
  Date: MyType<'date'>;
  DateTime: MyType<'datetime'>;
  Time: MyType<'time'>;
}

const toRealSnap = <T extends Query<any>>(query: T): ResultSet<MyConfig, T, false> => {
  return undefined as any;
};

/** @dts-jest enable:test-type */
const { defineDb } = bootstrap<MyConfig>();

const foo = defineTable({
  id: uuid().primaryKey().default(`gen_random_uuid()`),
  int4: int4(),
  int8: int8(),
  float4: float4(),
  float8: float8(),
  numeric: numeric(),
  text: text(),
  date: date(),
  dateTime: timestampWithTimeZone(),
  time: time(),
});

const db = defineDb({ foo }, () => Promise.resolve({ rows: [], affectedCount: 0 }));

// @dts-jest:group custom data types
{
  // @dts-jest:snap should select count
  toRealSnap(db.select(count()).from(db.foo));
}
