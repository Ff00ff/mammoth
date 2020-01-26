import { createDatabase } from '../database';
import { UuidColumn, IntegerColumn, TextColumn, TimestampWithTimeZoneColumn } from '../columns';
import { UuidGenerateV4, Now } from '../keywords';

describe(`insert`, () => {
  class Item {
    id = new UuidColumn()
      .primary()
      .notNull()
      .default(new UuidGenerateV4());
    createdAt = new TimestampWithTimeZoneColumn().notNull().default(new Now());
    name = new TextColumn().notNull();
    value = new IntegerColumn();
  }

  const db = createDatabase(process.env.DATABASE_URL!, {
    item: new Item(),
  });

  beforeEach(async () => {
    await db.sql`CREATE TABLE item (
      id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      name TEXT NOT NULL,
      value INTEGER
    )`;
  });

  afterEach(async () => {
    await db.sql`DROP TABLE item`;
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
        createdAt: new Now(),
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
});
