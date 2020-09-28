import { count, defineDb, defineTable, integer, text, timestampWithTimeZone, uuid } from '../../.build';

import { Query } from '../../.build/query';
import { ResultSet } from '../../.build/result-set';

const toSnap = <T extends Query<any>>(query: T): ResultSet<T, true> => {
  return undefined as any;
};

/** @dts-jest enable:test-type */

const foo = defineTable(`foo`, {
  id: uuid().primaryKey().default(`gen_random_id()`),
  createDate: timestampWithTimeZone().notNull().default(`now()`),
  name: text().notNull(),
  value: integer(),
});

const db = defineDb(() => Promise.resolve({ rows: [], affectedRowsCount: 0 }));

// @dts-jest:group insert
{
  // @dts-jest:snap should insert and returning count
  toSnap(db.insertInto(foo).values({ name: `Test` }));

  db.insertInto(foo).values({ name: `Test` }).then(result => {
    // @dts-jest:snap should insert and await affect count
    result;
  })

  db.insertInto(foo).values({ name: `Test` }).returning(`name`).then(result => {
    // @dts-jest:snap should insert-returning and await rows
    result;
  })
}
