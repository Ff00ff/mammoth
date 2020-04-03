import { integer, text, timestamptz, uuid } from './../columns/dataTypes';

import { createDatabase } from '../database';
import { defineTable } from '../defines/table';
import { now } from '../keywords';

describe(`insert`, () => {
  const item = defineTable({
    id: uuid()
      .primaryKey()
      .notNull()
      .default(`gen_random_uuid()`),
    createdAt: timestamptz()
      .notNull()
      .default(`now()`),
    name: text().notNull(),
    value: integer(),
  });

  const entry = defineTable({
    id: uuid()
      .primaryKey()
      .notNull()
      .default(`gen_random_uuid()`),
    createdAt: timestamptz()
      .notNull()
      .default(`now()`),
    value: integer().default(1),
  });

  const db = createDatabase(process.env.DATABASE_URL!, {
    item,
    entry,
  });

  beforeEach(async () => {
    await db.sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`;

    await db.sql`CREATE TABLE item (
      id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      name TEXT NOT NULL,
      value INTEGER
    )`;

    await db.sql`CREATE TABLE entry (
      id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      value INTEGER DEFAULT 1
    )`;
  });

  afterEach(async () => {
    await db.sql`DROP TABLE item, entry`;
  });

  afterAll(async () => {
    await db.destroy();
  });

  it(`should insert single row when using returning`, async () => {
    const item = await db
      .insertInto(db.item)
      .values({
        name: `Item #1`,
      })
      .returning(`name`);

    expect(item).toMatchInlineSnapshot(`
      Object {
        "name": "Item #1",
      }
    `);
  });

  it(`should insert and return using column syntax`, async () => {
    const item = await db
      .insertInto(db.item)
      .values({
        name: `Item #1`,
      })
      .returning(db.item.name);

    expect(item).toMatchInlineSnapshot(`
Object {
  "name": "Item #1",
}
`);
  });

  it(`should insert multiple rows and return them when using returning`, async () => {
    const items = await db
      .insertInto(db.item)
      .values([
        {
          name: `Item #1`,
        },
        {
          name: `Item #2`,
        },
      ])
      .returning(`name`);

    expect(items).toMatchInlineSnapshot(`
      Array [
        Object {
          "name": "Item #1",
        },
        Object {
          "name": "Item #2",
        },
      ]
    `);
  });

  it(`should upsert and update using a keyword`, async () => {
    const result = await db
      .insertInto(db.item)
      .values({
        name: `Item #1`,
      })
      .onConflict(`id`)
      .doUpdateSet({
        createdAt: now(),
      });
    expect(result).toEqual(1);
  });

  it(`should upsert and update using a subquery`, async () => {
    const result = await db
      .insertInto(db.item)
      .values({
        name: `Item #1`,
      })
      .onConflict(`id`)
      .doUpdateSet({
        value: db
          .select(db.item.value)
          .from(db.item)
          .orderBy(db.item.value.desc())
          .limit(1),
      });
    expect(result).toEqual(1);
  });

  it(`should upsert using where clause`, async () => {
    const result = await db
      .insertInto(db.item)
      .values({ name: `Item #1` })
      .onConflict(`id`)
      .doUpdateSet({ value: db.item.value.plus(1) })
      .where(db.item.value.lt(100));

    expect(result).toEqual(1);
  });

  it(`should err when inserting multiple rows with default values`, async () => {
    expect.assertions(1);

    try {
      await db.insertInto(db.entry).values([{ value: null }, { value: null }]);
    } catch (e) {
      expect(e).toMatchInlineSnapshot(
        `[Error: Cannot insert multiple rows with only default values]`,
      );
    }
  });
});
