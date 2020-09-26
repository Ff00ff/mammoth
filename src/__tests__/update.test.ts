import { defineDb, defineTable, integer, text, timestampWithTimeZone, uuid } from '..';

import { toSnap } from './helpers';

describe(`update`, () => {
  const foo = defineTable(`foo`, {
    id: uuid().primaryKey().default(`gen_random_id()`),
    createDate: timestampWithTimeZone().notNull().default(`now()`),
    name: text().notNull(),
    value: integer(),
  });

  const db = defineDb(() => Promise.resolve({ rows: [], affectedRowsCount: 0 }));

  it(`should update foo`, () => {
    const query = db
      .update(foo)
      .set({ name: `Test` })
      .where(foo.value.isNull())
      .returning(`id`, `createDate`);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [
          "Test",
        ],
        "text": "UPDATE foo SET name = $1 WHERE foo.value IS NULL RETURNING id, create_date \\"createDate\\"",
      }
    `);
  });
});
