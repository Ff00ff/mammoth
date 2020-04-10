import { integer, text, timestamptz, uuid } from '../columns/dataTypes';

import { createDatabase } from '../database';
import { defineTable } from '../defines';

const item = defineTable({
  id: uuid()
    .primary()
    .notNull()
    .default(`gen_random_uuid()`),
  createdAt: timestamptz()
    .notNull()
    .default(`now()`),
  name: text().notNull(),
  value: integer(),
});

const db = createDatabase(process.env.DATABASE_URL!, {
  item,
});

// Mammoth uses complex types everywhere to create its query builder. Even though Mammoth is
// covered by tests in most places, some of the features cannot be covered using traditional tests.
// For example, it's not possible to test if something isn't allowed. So these things are easy to
// break. To avoid things suddenly breaking, we use dts-jest which helps us assert types. This
// makes it possible to do test what should not be allowed.

// In these tests, there is no need to cover the happy path as we assume the regular tests cover
// these already.

// @dts-jest:fail:snap should require not-nullable name when inserting new row
db.insertInto(db.item).values({});

// @dts-jest:fail:snap should not allow unknown column when inserting
db.insertInto(db.item).values({ name: `Test`, foo: `Test` });

// @dts-jest:fail:snap should disallow passing in number instead of string of not-nullable column
db.insertInto(db.item).values({ name: 123 });

// @dts-jest:fail:snap should disallow passing in string instead of number of nullable column
db.insertInto(db.item).values({ value: `test` });

// @dts-jest:fail:snap should disallow unknown column in returning
db.insertInto(db.item)
  .values({ name: `correct` })
  .returning(`asd`);

// @dts-jest:pass:snap should insert with correct types
db.insertInto(db.item).values({ name: `test`, value: 123 });
