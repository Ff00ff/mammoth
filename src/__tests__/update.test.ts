import { defineDb, defineTable, integer, text, timestampWithTimeZone, uuid } from '..';

import { toSnap } from './helpers';

describe(`update`, () => {
  const foo = defineTable(`foo`, {
    id: uuid().primaryKey().default(`gen_random_id()`),
    createDate: timestampWithTimeZone().notNull().default(`now()`),
    name: text().notNull(),
    value: integer(),
  });

  const bar = defineTable(`bar`, {
    id: uuid().primaryKey().default(`gen_random_id()`),
    fooId: uuid().notNull().references(foo, `id`),
    name: text(),
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

  it(`should update-from foo`, () => {
    const query = db
      .update(foo)
      .set({ name: `Test` })
      .from(bar)
      .where(bar.fooId.eq(foo.id).and(bar.name.isNotNull()));

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [
          "Test",
        ],
        "text": "UPDATE foo SET name = $1 FROM bar WHERE bar.foo_id = foo.id AND bar.name IS NOT NULL",
      }
    `);
  });

  it(`should update where current of foo`, () => {
    const query = db.update(foo).set({ name: `Test` }).whereCurrentOf(`cursor1`);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [
          "Test",
          "cursor1",
        ],
        "text": "UPDATE foo SET name = $1 WHERE CURRENT OF $2",
      }
    `);
  });
});
