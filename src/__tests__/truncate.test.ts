import { defineDb, defineTable, integer, text, timestampWithTimeZone, uuid } from '..';

import { toSnap } from './helpers';

describe(`truncate`, () => {
  const foo = defineTable({
    id: uuid().primaryKey().default(`gen_random_uuid()`),
    createDate: timestampWithTimeZone().notNull().default(`now()`),
    name: text().notNull(),
    value: integer(),
  });

  const bar = defineTable({
    id: uuid().primaryKey().default(`gen_random_uuid()`),
  });

  const baz = defineTable({
    id: uuid().primaryKey().default(`gen_random_uuid()`),
  });

  const db = defineDb(
    {
      foo,
      bar,
      baz,
    },
    () => Promise.resolve({ rows: [], affectedCount: 1 }),
  );

  it(`should truncate`, () => {
    const query = db.truncate(db.foo);

    expect(toSnap(query)).toMatchInlineSnapshot(`
                Object {
                  "parameters": Array [],
                  "text": "TRUNCATE foo",
                }
            `);
  });

  it(`should restart identity`, () => {
    const query = db.truncate(db.foo).restartIdentity();

    expect(toSnap(query)).toMatchInlineSnapshot(`
                Object {
                  "parameters": Array [],
                  "text": "TRUNCATE foo RESTART IDENTITY",
                }
            `);
  });

  it(`should continue identity`, () => {
    const query = db.truncate(db.foo).continueIdentity();

    expect(toSnap(query)).toMatchInlineSnapshot(`
                Object {
                  "parameters": Array [],
                  "text": "TRUNCATE foo CONTINUE IDENTITY",
                }
            `);
  });

  it(`should cascade`, () => {
    const query = db.truncate(db.foo).cascade();

    expect(toSnap(query)).toMatchInlineSnapshot(`
                Object {
                  "parameters": Array [],
                  "text": "TRUNCATE foo CASCADE",
                }
            `);
  });

  it(`should restrict`, () => {
    const query = db.truncate(db.foo).restrict();

    expect(toSnap(query)).toMatchInlineSnapshot(`
                Object {
                  "parameters": Array [],
                  "text": "TRUNCATE foo RESTRICT",
                }
            `);
  });

  it(`should return affectedCount`, async () => {
    const query = await db.truncate(db.foo);
    expect(query).toBe(1);
  });
});
