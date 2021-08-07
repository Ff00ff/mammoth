import {
  TableRow,
  arrayAgg,
  coalesce,
  count,
  defineDb,
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
  timestampWithTimeZone,
  uuid,
  DbConfig,
  GetMostSignificantDataType,
  Float4,
  DefaultDbConfig,
} from '../../.build';

import { Query } from '../../.build/query';
import { ResultSet } from '../../.build/result-set';

const toSnap = <T extends Query<any>>(query: T): ResultSet<DefaultDbConfig, T, true> => {
  return undefined as any;
};

const toTableRow = <T>(table: T): TableRow<DefaultDbConfig, T> => {
  return undefined as any;
};

/** @dts-jest enable:test-type */

const foo = defineTable({
  id: uuid().primaryKey().default(`gen_random_uuid()`),
  createDate: timestampWithTimeZone().notNull().default(`now()`),
  name: text().notNull(),
  value: integer(),
});

const bar = defineTable({
  id: uuid().primaryKey().default(`gen_random_uuid()`),
  startDate: timestampWithTimeZone().notNull().default(`now()`),
  endDate: timestampWithTimeZone().notNull().default(`now()`),
  value: integer(),
  fooId: uuid().references(foo, 'id'),
});

const buzz = defineTable({
  id: uuid().primaryKey().default(`gen_random_uuid()`),
  name: text(),
  other: text().notNull(),
});

const crate = defineTable({
  float4: float4(),
  float8: float8(),
  int4: int4(),
  int8: int8(),
  numeric: numeric(),
});

const ding = defineTable({
  id: text().primaryKey(),
  value: integer().default(`1`),
});

// @dts-jest:snap should output all columns and the data type
toTableRow(foo);

const db = defineDb({ foo, bar, buzz, crate, ding }, () =>
  Promise.resolve({ rows: [], affectedCount: 0 }),
);

// @dts-jest:group select
{
  // @dts-jest:snap should return null and not null properties
  toSnap(db.select(db.foo.id, db.foo.createDate, db.foo.value).from(db.foo));

  // @dts-jest:snap should return nullable properties of left joined columns
  toSnap(db.select(db.foo.id, db.bar.endDate, db.bar.value).from(db.foo).leftJoin(db.bar));

  // @dts-jest:snap should return nullable properties of left side properties when right joining
  toSnap(db.select(db.foo.name, db.bar.startDate, db.bar.value).from(db.foo).rightJoin(db.bar));

  // @dts-jest:snap should select * and return nullable properties of left side properties when right joining
  toSnap(db.select(star()).from(db.foo).rightJoin(db.bar));

  // @dts-jest:snap should select foo.* and ignore the rest
  toSnap(db.select(star(db.foo)).from(db.foo).innerJoin(db.bar));

  // @dts-jest:snap should return renamed properties because of alias
  toSnap(db.select(db.foo.name.as(`fooName`), db.foo.value.as(`fooValue`)).from(db.foo));

  // @dts-jest:snap should return nullable properties of all sides because of full join
  toSnap(db.select(db.foo.name, db.bar.startDate, db.bar.value).from(db.foo).fullJoin(db.bar));

  // @dts-jest:snap should select expression
  toSnap(db.select(db.foo.value.plus(1)).from(db.foo));

  // @dts-jest:snap should select named expression
  toSnap(db.select(db.foo.value.plus(1).as(`test`)).from(db.foo));

  // @dts-jest:snap should select aggregate subquery
  toSnap(db.select(db.foo.id, db.select(count()).from(db.foo)).from(db.foo));

  // @dts-jest:snap should select array_agg
  toSnap(db.select(arrayAgg(db.foo.name)).from(db.foo));

  // @dts-jest:snap should select null column in subquery
  toSnap(db.select(db.foo.id, db.select(db.foo.value).from(db.foo)).from(db.foo));

  // @dts-jest:snap should select aggregate with alias
  toSnap(db.select(db.foo.id, sum(db.foo.value).as(`total`)).from(db.foo));

  // @dts-jest:snap should convert null value to not null using coalesce
  toSnap(db.select(coalesce(db.foo.value, 1)).from(db.foo));

  // @dts-jest:snap should convert not convert null value to not null using null in coalesce
  toSnap(db.select(coalesce(db.foo.value, 1 as null | number)).from(db.foo));

  // @dts-jest:snap coalesce should not convert to not null when passing another nullable value
  toSnap(db.select(coalesce(db.foo.value, db.foo.value)).from(db.foo));

  // @dts-jest:snap should select foo.* from foo
  toSnap(db.select(star(db.foo)).from(db.foo));

  // @dts-jest:snap should select * from foo
  toSnap(db.select(star()).from(db.foo));

  // @dts-jest:snap should select * from foo left join bar
  toSnap(db.select(star()).from(db.foo).leftJoin(db.bar).on(db.bar.fooId.eq(db.foo.id)));

  // @dts-jest:snap should select * from foo right join bar
  toSnap(db.select(star()).from(db.foo).rightJoin(db.bar).on(db.bar.fooId.eq(db.foo.id)));

  toSnap(
    db
      .select(db.foo.id)
      .from(db.foo)
      // @dts-jest:fail:snap should not use in with wrong data type
      .where(db.foo.id.in(db.select(db.foo.createDate).from(db.foo))),
  );

  // @dts-jest with test as select * from foo select * from test
  toSnap(
    db.with(`test`, db.select(star()).from(db.foo), ({ test }) => db.select(star()).from(test)),
  );

  // @dts-jest:snap should select case with correct type and alias
  toSnap(
    db
      .select(
        db
          .case()
          .when(db.foo.value.gt(100))
          .then('A' as const)
          .when(db.foo.value.gt(0))
          .then('B' as const)
          .else('C' as const)
          .end()
          .as(`bar`),
      )
      .from(db.foo),
  );

  db.select(db.foo.id, db.foo.value)
    .from(db.foo)
    .then((result) => {
      // @dts-jest:snap should select and await result set
      result;
    });

  db.select(db.foo.id)
    .from(db.foo)
    .then((result) => {
      // @dts-jest:snap should return correct result in then
      result;
      return 123;
    })
    .then((result) => {
      // @dts-jest:snap should return previous return value in then
      result;
    });

  // @dts-jest:snap should select raw expression
  toSnap(db.select(db.foo.id, raw<number, false, `test`>`test`).from(db.foo));

  // @dts-jest:snap should return nullable text when calling concat on nullable column
  db.buzz.name.concat(db.buzz.other);

  // @dts-jest:snap should return nullable text when calling concat with nullable input
  db.buzz.other.concat(db.buzz.name);

  // @dts-jest:snap float4 + int4 = float8
  db.crate.float4.plus(db.crate.int4);

  // @dts-jest:snap float8 + int8 = float8
  db.crate.float8.plus(db.crate.int8);

  // @dts-jest:snap int8 + int4 = int8
  db.crate.int8.plus(db.crate.int4);

  // @dts-jest:snap int4 + int4 = int4
  db.crate.int4.plus(db.crate.int4);

  // @dts-jest:snap should select column with default which is nullable
  toSnap(db.select(db.ding.value).from(db.ding));

  const result = db.crate.float4.plus(db.crate.float4);
  // @dts-jest:snap float4 + float4 = float4
  result;
}
