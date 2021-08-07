import {
  Int4,
  count,
  defineDb,
  defineTable,
  integer,
  raw,
  serial,
  text,
  timestampWithTimeZone,
  uuid,
  DefaultDbConfig,
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

const serialTest = defineTable({
  id: serial().primaryKey(),
  value: integer(),
});

const db = defineDb({ foo, serialTest }, () => Promise.resolve({ rows: [], affectedCount: 0 }));

// @dts-jest:group insert check
{
  // @dts-jest:snap should insert and returning count
  toSnap(db.insertInto(db.foo).values({ name: `Test` }));

  // @dts-jest:snap should insert multiple rows and returning count
  toSnap(db.insertInto(db.foo).values([{ name: `Test` }, { name: `Test 2` }]));

  // @dts-jest:snap should insert default column
  toSnap(db.insertInto(db.foo).values({ name: `Test`, createDate: new Date() }));

  // @dts-jest:fail:snap should not insert unknown column
  toSnap(db.insertInto(db.foo).values({ name: `Test`, asd: `Test` }));

  // @dts-jest:fail:snap should not insert invalid type in known column
  toSnap(db.insertInto(db.foo).values({ name: 123 }));

  // @dts-jest:fail:snap should not insert multiple rows with invalid colums
  toSnap(db.insertInto(db.foo).values([{ name: `Test` }, { name: `Test 2`, asd: 123 }]));

  db.insertInto(db.foo)
    .values({ name: `Test` })
    .then((result) => {
      // @dts-jest:snap should insert and await affect count
      result;
    });

  db.insertInto(db.foo)
    .values({ name: `Test` })
    .returning(`name`)
    .then((result) => {
      // @dts-jest:snap should insert-returning and await rows
      result;
    });

  // @dts-jest:snap should insert without explicit value for column serial
  db.insertInto(db.serialTest).values({
    value: 123,
  });

  // @dts-jest:snap should insert by setting value to null
  db.insertInto(db.serialTest).values({
    value: null,
  });

  db.insertInto(db.serialTest).values({
    // @dts-jest:snap:fail should not insert by setting value to undefined
    value: undefined,
  });

  // @dts-jest:snap should insert with expression of the not-null correct type
  db.insertInto(db.serialTest).values({
    value: raw<Int4, true>`get_value()`,
  });

  // @dts-jest:snap should insert with expression of the nullable correct type
  db.insertInto(db.serialTest).values({
    value: raw<number, false>`get_value()`,
  });

  db.insertInto(db.serialTest).values({
    // @dts-jest:fail:snap should not insert with wrong type of expression
    value: raw<string>`get_value()`,
  });

  // @dts-jest:snap should insert using subquery
  db.insertInto(db.foo).values({ name: db.select(db.foo.name.concat(` 2`)).from(db.foo).limit(1) });
}
