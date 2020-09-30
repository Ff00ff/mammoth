import { defineDb, defineTable, integer, text, timestampWithTimeZone, uuid } from '..';

import { toSnap } from './helpers';

describe(`update`, () => {
  const foo = defineTable({
    id: uuid().primaryKey().default(`gen_random_id()`),
    createDate: timestampWithTimeZone().notNull().default(`now()`),
    name: text().notNull(),
    value: integer(),
  });

  const bar = defineTable({
    id: uuid().primaryKey().default(`gen_random_id()`),
    fooId: uuid().notNull().references(foo, `id`),
    name: text(),
  });

  const db = defineDb({ foo, bar }, () => Promise.resolve({ rows: [], affectedCount: 0 }));

  it(`should update foo`, () => {
    const query = db
      .update(db.foo)
      .set({ name: `Test` })
      .where(db.foo.value.isNull())
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
      .update(db.foo)
      .set({ name: `Test` })
      .from(db.bar)
      .where(db.bar.fooId.eq(db.foo.id).and(db.bar.name.isNotNull()));

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
    const query = db.update(db.foo).set({ name: `Test` }).whereCurrentOf(`cursor1`);

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
