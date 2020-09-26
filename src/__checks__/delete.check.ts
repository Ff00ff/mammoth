import { Query, ResultSet } from '../types';
import { count, defineDb, defineTable, integer, text, timestampWithTimeZone, uuid } from '..';

/** @dts-jest enable:test-type */

const foo = defineTable(`foo`, {
  id: uuid().primaryKey().default(`gen_random_id()`),
  createDate: timestampWithTimeZone().notNull().default(`now()`),
  name: text().notNull(),
  value: integer(),
});

const toSnap = <T extends Query>(query: T): ResultSet<T> => {
  return undefined as any;
};

const db = defineDb(() => Promise.resolve({ rows: [], affectedRowsCount: 0 }));

// @dts-jest:group update
{
  // @dts-jest:snap should delete and returning id
  toSnap(db.deleteFrom(foo).returning(`id`));
}
