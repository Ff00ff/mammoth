import {
  count,
  defineDb,
  defineTable,
  integer,
  sum,
  text,
  timestampWithTimeZone,
  uuid,
} from "..";

import { toSnap } from "./helpers";

describe(`select`, () => {
  const foo = defineTable(`foo`, {
    id: uuid().primaryKey().default(`gen_random_id()`),
    createDate: timestampWithTimeZone().notNull().default(`now()`),
    name: text().notNull(),
    value: integer(),
  });

  const db = defineDb(() =>
    Promise.resolve({ rows: [], affectedRowsCount: 0 })
  );

  it(`should select foo`, () => {
    const query = db.select(foo.id).from(foo);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id FROM foo",
      }
    `);
  });

  it(`should alias a column`, () => {
    const query = db.select(foo.id.as(`fooId`)).from(foo);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id \\"fooId\\" FROM foo",
      }
    `);
  });

  it(`should alias a table plus reference it in a condition `, () => {
    const baz = foo.as(`baz`);
    const query = db.select(baz.id).from(baz).where(baz.value.eq(1));

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [
          1,
        ],
        "text": "SELECT baz.id FROM foo \\"baz\\" WHERE baz.value = $1",
      }
    `);
  });

  it(`should plus a column as expression`, () => {
    const query = db.select(foo.id, foo.value.plus(1).as(`test`)).from(foo);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [
          1,
        ],
        "text": "SELECT foo.id, ((foo.value + $1) \\"test\\") FROM foo",
      }
    `);
  });

  it(`should select subquery`, () => {
    const query = db.select(foo.id, db.select(foo.value).from(foo)).from(foo);
    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id, (SELECT foo.value FROM foo) FROM foo",
      }
    `);
  });

  it(`should select IN with subquery`, () => {
    const query = db
      .select(foo.id)
      .from(foo)
      .where(foo.id.in(db.select(foo.id).from(foo)));

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id FROM foo WHERE foo.id IN (SELECT foo.id FROM foo)",
      }
    `);
  });

  it(`should convert column to snake case`, () => {
    const query = db.select(foo.createDate).from(foo);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.create_date \\"createDate\\" FROM foo",
      }
    `);
  });

  it(`should select aggregate with as`, () => {
    const query = db.select(foo.id, sum(foo.value).as(`total`)).from(foo);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id, ((SUM (foo.value)) \\"total\\") FROM foo",
      }
    `);
  });

  it(`should select with in`, () => {
    const query = db.select(foo.id).where(foo.name.in([`A`, `B`, `C`]));

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [
          "A",
          "B",
          "C",
        ],
        "text": "SELECT foo.id WHERE foo.name IN ($1, $2, $3)",
      }
    `);
  });

  it(`should select with order by`, () => {
    const query = db.select(foo.id).orderBy(foo.name.asc().nullsFirst());

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id ORDER BY foo.name ASC NULLS FIRST",
      }
    `);
  });

  it(`should select where is not null`, () => {
    const query = db.select(foo.id).where(foo.value.isNotNull());

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id WHERE foo.value IS NOT NULL",
      }
    `);
  });

  it(`should basic math`, () => {
    const query = db
      .select(foo.id)
      .from(foo)
      .where(
        foo.value
          .plus(1)
          .multiply(2)
          .minus(3)
          .divide(4)
          .modulo(5)
          .between(-10)
          .and(10)
      );

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [
          1,
          2,
          3,
          4,
          5,
          -10,
          10,
        ],
        "text": "SELECT foo.id FROM foo WHERE foo.value + $1 * $2 - $3 / $4 % $5 BETWEEN $6 AND $7",
      }
    `);
  });

  it(`should select camel cased`, () => {
    const query = db.select(foo.id).from(foo).where(foo.createDate.isNotNull());

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id FROM foo WHERE foo.create_date IS NOT NULL",
      }
    `);
  });

  it(`should select aggregate on camel cased column`, () => {
    const query = db.select(count(foo.createDate)).from(foo);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT (COUNT (foo.create_date \\"createDate\\")) FROM foo",
      }
    `);
  });
});
