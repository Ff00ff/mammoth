import { createDatabase } from '../database';
import { UuidColumn, IntegerColumn, TextColumn } from '../columns';
import { UuidGenerateV4 } from '../keywords';

describe(`sql`, () => {
  class Item {
    id = new UuidColumn()
      .primary()
      .notNull()
      .default(new UuidGenerateV4());
    name = new TextColumn().notNull();
    value = new IntegerColumn();
  }

  const db = createDatabase(process.env.DATABASE_URL!, {
    item: new Item(),
  });

  beforeEach(async () => {
    await db.sql`CREATE TABLE item (
      id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      value INTEGER
    )`;
  });

  afterEach(async () => {
    await db.sql`DROP TABLE item`;
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
});
