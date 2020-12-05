import { defineDb, defineTable, integer, text, timestampWithTimeZone, uuid } from '../../.build';
import { Query } from '../../.build/query';
import { ResultSet } from '../../.build/result-set';

const toSnap = <T extends Query<any>>(query: T): ResultSet<T, true> => {
  return undefined as any;
};

/** @dts-jest enable:test-type */

const foo = defineTable({
  id: uuid().primaryKey().default(`gen_random_uuid()`),
  createDate: timestampWithTimeZone().notNull().default(`now()`),
  name: text().notNull(),
  value: integer(),
});

const db = defineDb({ foo }, () => Promise.resolve({ rows: [], affectedCount: 0 }));

// @dts-jest:group truncate
{
  // @dts-jest:snap should truncate
  toSnap(db.truncate(db.foo));

  db.truncate(db.foo).then((result) => {
    // @dts-jest:snap should truncate and await affected row count
    result;
  });
}
