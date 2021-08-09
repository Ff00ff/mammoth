import {
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

// @dts-jest:group delete
{
  // @dts-jest:snap should delete and returning id
  toSnap(db.deleteFrom(db.foo).returning(`id`));

  db.deleteFrom(db.foo).then((result) => {
    // @dts-jest:snap should delete and await affected row count
    result;
  });

  db.deleteFrom(db.foo)
    .returning(`id`)
    .then((result) => {
      // @dts-jest:snap should delete and await rows
      result;
    });
}
