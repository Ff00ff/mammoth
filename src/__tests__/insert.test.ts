import { defineDb, defineTable, integer, text, timestampWithTimeZone, toSql, uuid } from '..';

import { raw } from '../sql-functions';

describe(`insert`, () => {
  const foo = defineTable({
    id: uuid().primaryKey().default(`gen_random_uuid()`),
    createDate: timestampWithTimeZone().notNull().default(`now()`),
    name: text().notNull(),
    value: integer(),
  });

  const db = defineDb({ foo }, () => Promise.resolve({ rows: [], affectedCount: 0 }));

  it(`should insert a single row`, () => {
    const query = db.insertInto(db.foo).values({
      name: `Test`,
    });

    expect(toSql(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [
          "Test",
        ],
        "text": "INSERT INTO foo (name) VALUES ($1)",
      }
    `);
  });

  it(`should insert multiple rows`, () => {
    const query = db.insertInto(db.foo).values([
      {
        name: `Test`,
      },
      {
        name: `Test 2`,
      },
    ]);

    expect(toSql(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [
          "Test",
          "Test 2",
        ],
        "text": "INSERT INTO foo (name) VALUES ($1), ($2)",
      }
    `);
  });

  it(`should insert foo on conflict do update set`, () => {
    const query = db
      .insertInto(db.foo)
      .values({
        name: `Test`,
      })
      .onConflict(`id`)
      .doUpdateSet({
        name: `Test 2`,
      });

    expect(toSql(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [
          "Test",
          "Test 2",
        ],
        "text": "INSERT INTO foo (name) VALUES ($1) ON CONFLICT (id) DO UPDATE SET name = $2",
      }
    `);
  });

  it(`should handle multi-column onConflict`, () => {
    const query = db
      .insertInto(db.foo)
      .values({
        name: `Test`,
      })
      .onConflict(`id`, `name`)
      .doUpdateSet({
        name: `Test 2`,
      });

    expect(toSql(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [
          "Test",
          "Test 2",
        ],
        "text": "INSERT INTO foo (name) VALUES ($1) ON CONFLICT (id, name) DO UPDATE SET name = $2",
      }
    `);
  });

  it(`should insert with default values`, () => {
    const query = db.insertInto(db.foo).defaultValues();

    expect(toSql(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "INSERT INTO foo DEFAULT VALUES",
      }
    `);
  });

  it(`should insert with returning`, () => {
    const query = db.insertInto(db.foo).values({ name: `Test` }).returning(`id`);

    expect(toSql(query)).toMatchInlineSnapshot(`
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
      .insertInto(db.foo, [`name`, `value`, `createDate`])
      .select(db.foo.id, db.foo.name, db.foo.createDate)
      .from(db.foo);

    expect(toSql(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "INSERT INTO foo (name, value, create_date) SELECT foo.id, foo.name, foo.create_date \\"createDate\\" FROM foo",
      }
    `);
  });

  it(`should insert update returning`, () => {
    const query = db
      .insertInto(db.foo, [`name`, `value`, `createDate`])
      .update(db.foo)
      .set({ value: 123 })
      .returning(`name`, `value`, `createDate`);

    expect(toSql(query)).toMatchInlineSnapshot(`
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
      .insertInto(db.foo, [`name`, `value`, `createDate`])
      .deleteFrom(db.foo)
      .where(db.foo.value.lt(123))
      .returning(`name`, `value`, `createDate`);

    expect(toSql(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [
          123,
        ],
        "text": "INSERT INTO foo (name, value, create_date) DELETE FROM foo WHERE foo.value < $1 RETURNING name, value, create_date \\"createDate\\"",
      }
    `);
  });

  it(`insert into on conflict do nothing`, () => {
    const query = db.insertInto(db.foo).values({ name: `Test` }).onConflict().doNothing();

    expect(toSql(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [
          "Test",
        ],
        "text": "INSERT INTO foo (name) VALUES ($1) ON CONFLICT DO NOTHING",
      }
    `);
  });

  it(`should insert a single row using a raw expression`, () => {
    const query = db.insertInto(db.foo).values({
      name: raw<string, true, `name`>`get_some_text()`,
    });

    expect(toSql(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "INSERT INTO foo (name) VALUES ((get_some_text()))",
      }
    `);
  });

  it(`should insert using subquery`, () => {
    const query = db.insertInto(db.foo).values({
      name: db.select(db.foo.name.concat(` 2`)).from(db.foo).limit(1),
    });

    expect(toSql(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [
          " 2",
          1,
        ],
        "text": "INSERT INTO foo (name) VALUES ((SELECT foo.name || $1 FROM foo LIMIT $2))",
      }
    `);
  });

  it(`should insert non-null with default value`, () => {
    const query = db.insertInto(db.foo).values({
        name: `Test`,
        createDate: new Date('2023-01-01T06:00:00.000Z'),
    });
    expect(toSql(query)).toMatchInlineSnapshot(`
    Object {
      "parameters": Array [
        "Test",
        "2023-01-01T06:00:00.000Z"
      ],
      "text": "INSERT INTO foo (name, create_date) VALUES ($1, $2)",
    }
  `);
  })
});
