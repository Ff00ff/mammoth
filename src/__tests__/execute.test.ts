import {
  defineDb,
  defineTable,
  integer,
  text,
  timestampWithTimeZone,
  uuid,
} from "..";

describe(`execute`, () => {
  const foo = defineTable(`foo`, {
    id: uuid().primaryKey().default(`gen_random_id()`),
    createDate: timestampWithTimeZone().notNull().default(`now()`),
    name: text().notNull(),
    value: integer(),
  });

  const db = defineDb(() =>
    Promise.resolve({ rows: [{ a: `1` }, { b: `2` }], affectedRowsCount: 123 })
  );

  it(`select should return rows`, async () => {
    const rows = await db.select(foo.id).from(foo);

    expect(rows).toMatchInlineSnapshot(`
      Array [
        Object {
          "a": "1",
        },
        Object {
          "b": "2",
        },
      ]
    `);
  });

  it(`update should return count`, async () => {
    const count = await db.update(foo).set({ name: `Test` });

    expect(count).toMatchInlineSnapshot(`123`);
  });

  it(`update with returning should return rows`, async () => {
    const rows = await db.update(foo).set({ name: `Test` }).returning(`id`);

    expect(rows).toMatchInlineSnapshot(`
      Array [
        Object {
          "a": "1",
        },
        Object {
          "b": "2",
        },
      ]
    `);
  });

  it(`delete should return count`, async () => {
    const count = await db.deleteFrom(foo);

    expect(count).toMatchInlineSnapshot(`123`);
  });

  it(`delete with returning should return rows`, async () => {
    const rows = await db.deleteFrom(foo).returning(`id`);

    expect(rows).toMatchInlineSnapshot(`
      Array [
        Object {
          "a": "1",
        },
        Object {
          "b": "2",
        },
      ]
    `);
  });

  it(`insert should return count`, async () => {
    const count = await db.insertInto(foo).defaultValues();

    expect(count).toMatchInlineSnapshot(`123`);
  });

  it(`insert with returning should return rows`, async () => {
    const rows = await db.insertInto(foo).defaultValues().returning(`id`);

    expect(rows).toMatchInlineSnapshot(`
      Array [
        Object {
          "a": "1",
        },
        Object {
          "b": "2",
        },
      ]
    `);
  });
});
