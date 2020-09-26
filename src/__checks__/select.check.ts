import { Query, ResultSet } from '../types';
import { count, defineDb, defineTable, integer, sum, text, timestampWithTimeZone, uuid } from '..';

/** @dts-jest enable:test-type */

const foo = defineTable(`foo`, {
  id: uuid().primaryKey().default(`gen_random_id()`),
  createDate: timestampWithTimeZone().notNull().default(`now()`),
  name: text().notNull(),
  value: integer(),
});

const bar = defineTable(`bar`, {
  id: uuid().primaryKey().default(`gen_random_id()`),
  startDate: timestampWithTimeZone().notNull().default(`now()`),
  endDate: timestampWithTimeZone().notNull().default(`now()`),
  value: integer(),
  fooId: uuid().references(foo, 'id'),
});

const toSnap = <T extends Query>(query: T): ResultSet<T> => {
  return undefined as any;
};

const db = defineDb(() => Promise.resolve({ rows: [], affectedRowsCount: 0 }));

// @dts-jest:group select
{
  // @dts-jest:snap should return null and not null properties
  toSnap(db.select(foo.id, foo.createDate, foo.value).from(foo));

  // @dts-jest:snap should return nullable properties of left joined columns
  toSnap(db.select(foo.id, bar.endDate, bar.value).from(foo).leftJoin(bar));

  // @dts-jest:snap should return nullable properties of left side properties when right joining
  toSnap(db.select(foo.name, bar.startDate, bar.value).from(foo).rightJoin(bar));

  // @dts-jest:snap should return renamed properties because of alias
  toSnap(db.select(foo.name.as(`fooName`), foo.value.as(`fooValue`)).from(foo));

  // @dts-jest:snap should return nullable properties of all sides because of full join
  toSnap(db.select(foo.name, bar.startDate, bar.value).from(foo).fullJoin(bar));

  // @dts-jest:snap should select expression
  toSnap(db.select(foo.value.plus(1)).from(foo));

  // @dts-jest:snap should select named expression
  toSnap(db.select(foo.value.plus(1).as(`test`)).from(foo));

  // @dts-jest:snap should select aggregate subquery
  toSnap(db.select(foo.id, db.select(count()).from(foo)).from(foo));

  // @dts-jest:snap should select null column in subquery
  toSnap(db.select(foo.id, db.select(foo.value).from(foo)).from(foo));

  // @dts-jest:snap should select aggregate with alias
  toSnap(db.select(foo.id, sum(foo.value).as(`total`)).from(foo));
}
