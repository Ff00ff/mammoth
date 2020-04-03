import { uuid, timestamptz, text, integer } from './../columns/dataTypes';
import { defineTable } from '../defines';
import { createDatabase } from '../database';
import { now } from '../keywords';

describe(`update`, () => {
  const itemTable = defineTable({
    id: uuid()
      .primary()
      .notNull()
      .default(`gen_random_uuid()`),
    createdAt: timestamptz()
      .notNull()
      .default(now()),
    name: text().notNull(),
    value: integer(),
  });

  const db = createDatabase(process.env.DATABASE_URL!, {
    item: itemTable,
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

  it(`should update and return affect rows`, async () => {
    const affectedRows = await db.update(db.item).set({ value: undefined });

    expect(affectedRows).toEqual(0);
  });

  it(`should update with returning`, async () => {
    const result = await db
      .update(db.item)
      .set({ value: undefined })
      .returning(db.item.value);

    expect(result).toHaveLength(0);
  });
});
