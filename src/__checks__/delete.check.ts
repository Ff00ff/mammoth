import { Query, ResultSet } from '../types';
import { count, defineDb, defineTable, integer, text, timestampWithTimeZone, uuid } from '..';
import { DeleteQuery } from '../delete';

/** @dts-jest enable:test-type */

const foo = defineTable(`foo`, {
  id: uuid().primaryKey().default(`gen_random_id()`),
  createDate: timestampWithTimeZone().notNull().default(`now()`),
  name: text().notNull(),
  value: integer(),
});

const toSnap = <T extends Query>(query: T): ResultSet<T, true> => {
  return undefined as any;
};

const db = defineDb(() => Promise.resolve({ rows: [], affectedRowsCount: 0 }));

// @dts-jest:group delete
{
  // @dts-jest:snap should delete and returning id
  toSnap(db.deleteFrom(foo).returning(`id`));

  db.deleteFrom(foo).then(result => {
    // @dts-jest:snap should delete and await affected row count
    result;
  })

  db.deleteFrom(foo).returning(`id`).then(result => {
    // @dts-jest:snap should delete and await rows
    result;
  })
}
