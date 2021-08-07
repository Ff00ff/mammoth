import {
  count,
  DefaultDbConfig,
  defineDb,
  defineTable,
  integer,
  text,
  timestampWithTimeZone,
  uuid,
} from '../../.build';

import { Query } from '../../.build/query';
import { ResultSet } from '../../.build/result-set';

const toSnap = <T extends Query<any>>(query: T): ResultSet<DefaultDbConfig, T, true> => {
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

// @dts-jest:group update
{
  // @dts-jest:snap should update and returning id
  toSnap(db.update(db.foo).set({ name: `Test`, value: 123 }).returning(`id`));

  // @dts-jest:snap should update and returning two columns
  toSnap(db.update(db.foo).set({ name: `Test`, value: 123 }).returning(`id`, `name`));

  // @dts-jest:snap should update without returning and return number
  toSnap(db.update(db.foo).set({ name: `Test`, value: 123 }));

  db.update(db.foo)
    .set({ name: `Test` })
    .then((result) => {
      // @dts-jest:snap should update and await affected count
      result;
    });

  db.update(db.foo)
    .set({ name: `Test` })
    .returning(`name`)
    .then((result) => {
      // @dts-jest:snap should update-returning and await rows
      result;
    });
}
