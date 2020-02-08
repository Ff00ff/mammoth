import { createDatabase } from '../database';
import { UuidColumn, IntegerColumn, TextColumn, TimestampWithTimeZoneColumn } from '../columns';
import { GenRandomUuid, Now } from '../keywords';

describe(`delete`, () => {
  class Item {
    id = new UuidColumn()
      .primary()
      .notNull()
      .default(new GenRandomUuid());
    createdAt = new TimestampWithTimeZoneColumn().notNull().default(new Now());
    name = new TextColumn().notNull();
    value = new IntegerColumn();
  }

  const db = createDatabase(process.env.DATABASE_URL!, {
    item: new Item(),
  });

  beforeEach(async () => {
    await db.sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`;

    await db.sql`CREATE TABLE item (
      id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
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

  it(`should delete item using where clause`, async () => {
    const rows = await db
      .deleteFrom(db.item)
      .where(db.item.name.eq(`Test`))
      .returning(`name`);

    expect(rows).toHaveLength(0);
  });
});
