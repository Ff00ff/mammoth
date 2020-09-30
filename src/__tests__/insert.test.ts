import { defineDb, defineTable, integer, text, timestampWithTimeZone, uuid } from '..';

import { toSnap } from './helpers';

describe(`insert`, () => {
  const foo = defineTable(`foo`, {
    id: uuid().primaryKey().default(`gen_random_id()`),
    createDate: timestampWithTimeZone().notNull().default(`now()`),
    name: text().notNull(),
    value: integer(),
  });

  const db = defineDb({ foo }, () => Promise.resolve({ rows: [], affectedCount: 0 }));

  it(`should insert foo on conflict do update set`, () => {
    const query = db
      .insertInto(foo)
      .values({
        name: `Test`,
      })
      .onConflict(`id`)
      .doUpdateSet({
        name: `Test 2`,
      });

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [
          "Test",
          "Test 2",
        ],
        "text": "INSERT INTO foo (name) VALUES ($1) ON CONFLICT (id) DO UPDATE SET name = $2",
      }
    `);
  });

  it(`should insert with default values`, () => {
    const query = db.insertInto(foo).defaultValues();

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "INSERT INTO foo DEFAULT VALUES",
      }
    `);
  });

  it(`should insert with returning`, () => {
    const query = db.insertInto(foo).values({ name: `Test` }).returning(`id`);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [
          "Test",
        ],
        "text": "INSERT INTO foo (name) VALUES ($1) RETURNING id",
      }
    `);
  });

  it(`should insert into select`, () => {
    const query = db
      .insertInto(foo, [`name`, `value`, `createDate`])
      .select(foo.id, foo.name, foo.createDate)
      .from(foo);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "INSERT INTO foo (name, value, create_date) SELECT foo.id, foo.name, foo.create_date \\"createDate\\" FROM foo",
      }
    `);
  });

  it(`should insert update returning`, () => {
    const query = db
      .insertInto(foo, [`name`, `value`, `createDate`])
      .update(foo)
      .set({ value: 123 })
      .returning(`name`, `value`, `createDate`);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [
          123,
        ],
        "text": "INSERT INTO foo (name, value, create_date) UPDATE foo SET value = $1 RETURNING name, value, create_date \\"createDate\\"",
      }
    `);
  });

  it(`should insert delete returning`, () => {
    const query = db
      .insertInto(foo, [`name`, `value`, `createDate`])
      .deleteFrom(foo)
      .where(foo.value.lt(123))
      .returning(`name`, `value`, `createDate`);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [
          123,
        ],
        "text": "INSERT INTO foo (name, value, create_date) DELETE FROM foo WHERE foo.value < $1 RETURNING name, value, create_date \\"createDate\\"",
      }
    `);
  });

  it(`insert into on conflict do nothing`, () => {
    const query = db.insertInto(foo).values({ name: `Test` }).onConflict().doNothing();

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [
          "Test",
        ],
        "text": "INSERT INTO foo (name) VALUES ($1) ON CONFLICT DO NOTHING",
      }
    `);
  });
});
