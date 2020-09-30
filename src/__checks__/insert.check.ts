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

const db = defineDb(() => Promise.resolve({ rows: [], affectedCount: 0 }));

// @dts-jest:group insert check
{
  // @dts-jest:snap should insert and returning count
  toSnap(db.insertInto(foo).values({ name: `Test` }));

  // @dts-jest:snap should insert default column
  toSnap(db.insertInto(foo).values({ name: `Test`, createDate: new Date() }));

  // @dts-jest:fail:snap should not insert unknown column
  toSnap(db.insertInto(foo).values({ name: `Test`, asd: `Test` }));

  // @dts-jest:fail:snap should not insert invalid type in known column
  toSnap(db.insertInto(foo).values({ name: 123 }));

  db.insertInto(foo).values({ name: `Test` }).then(result => {
    // @dts-jest:snap should insert and await affect count
    result;
  })

  db.insertInto(foo).values({ name: `Test` }).returning(`name`).then(result => {
    // @dts-jest:snap should insert-returning and await rows
    result;
  })
}
