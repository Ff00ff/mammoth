import { GenRandomUuid, Now } from '../keywords';
import { IntegerColumn, TextColumn, TimestampWithTimeZoneColumn, UuidColumn } from '../columns';
import { text, uuid } from './../columns/dataTypes';

import { createDatabase } from '../database';
import { defineTable } from '../defines';

describe(`select`, () => {
  const item = defineTable({
    id: new UuidColumn()
      .primary()
      .notNull()
      .default(new GenRandomUuid()),
    createdAt: new TimestampWithTimeZoneColumn().notNull().default(new Now()),
    name: new TextColumn().notNull(),
    value: new IntegerColumn(),
  });

  const itemFoo = defineTable({
    id: uuid()
      .primary()
      .notNull()
      .default(new GenRandomUuid()),
    itemId: uuid()
      .notNull()
      .references(item, `id`),
    name: text().notNull(),
  });

  const db = createDatabase(
    { databaseUrl: process.env.DATABASE_URL!, debug: true },
    {
      item,
      itemFoo,
    },
  );

  beforeEach(async () => {
    await db.sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`;
    await db.sql`CREATE TABLE item (
      id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      name TEXT NOT NULL,
      value INTEGER
    )`;
    await db.sql`CREATE TABLE item_foo (
      id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
      item_id UUID NOT NULL REFERENCES item (id),
      name TEXT NOT NULL
    )`;
  });

  afterEach(async () => {
    await db.sql`DROP TABLE item, item_foo`;
  });

  afterAll(async () => {
    await db.destroy();
  });

  it(`should select and limit with a number`, async () => {
    const rows = await db
      .select(db.item.name)
      .from(db.item)
      .limit(10);

    expect(rows).toHaveLength(0);
  });

  it(`should select and limit with ALL`, async () => {
    const rows = await db
      .select(db.item.name)
      .from(db.item)
      .limit(`ALL`);

    expect(rows).toHaveLength(0);
  });

  it(`should select for update`, async () => {
    const rows = await db
      .select(db.item.name)
      .from(db.item)
      .forUpdate();

    expect(rows).toHaveLength(0);
  });

  it(`should select for no key update`, async () => {
    const rows = await db
      .select(db.item.name)
      .from(db.item)
      .forNoKeyUpdate();

    expect(rows).toHaveLength(0);
  });

  it(`should select for share`, async () => {
    const rows = await db
      .select(db.item.name)
      .from(db.item)
      .forShare();

    expect(rows).toHaveLength(0);
  });

  it(`should select for no key share`, async () => {
    const rows = await db
      .select(db.item.name)
      .from(db.item)
      .forNoKeyShare();

    expect(rows).toHaveLength(0);
  });

  it(`should select for update of tables`, async () => {
    const rows = await db
      .select(db.item.name)
      .from(db.item)
      .crossJoin(db.itemFoo)
      .forUpdate()
      .of(db.item, db.itemFoo);

    expect(rows).toHaveLength(0);
  });

  it(`should select skip locked`, async () => {
    const rows = await db
      .select(db.item.name)
      .from(db.item)
      .forUpdate()
      .skipLocked();

    expect(rows).toHaveLength(0);
  });

  it(`should select nowait`, async () => {
    const rows = await db
      .select(db.item.name)
      .from(db.item)
      .forUpdate()
      .nowait();

    expect(rows).toHaveLength(0);
  });

  it(`should left join`, async () => {
    const rows = await db
      .select(db.itemFoo.id, db.itemFoo.name, db.item.value)
      .from(db.itemFoo)
      .leftJoin(db.item)
      .on(db.itemFoo.itemId.eq(db.item.id));

    expect(rows).toHaveLength(0);
  });

  it(`should cross join`, async () => {
    const rows = await db
      .select(db.itemFoo.id, db.itemFoo.name, db.item.value)
      .from(db.itemFoo)
      .crossJoin(db.item);

    expect(rows).toHaveLength(0);
  });

  it(`should join`, async () => {
    const rows = await db
      .select(db.itemFoo.id, db.itemFoo.name, db.item.value)
      .from(db.itemFoo)
      .join(db.item)
      .on(db.itemFoo.itemId.eq(db.item.id));

    expect(rows).toHaveLength(0);
  });

  it(`should right join`, async () => {
    const rows = await db
      .select(db.itemFoo.id, db.itemFoo.name, db.item.value)
      .from(db.itemFoo)
      .rightJoin(db.item)
      .on(db.itemFoo.itemId.eq(db.item.id));

    expect(rows).toHaveLength(0);
  });

  it(`should left outer join`, async () => {
    const rows = await db
      .select(db.itemFoo.id, db.itemFoo.name, db.item.value)
      .from(db.itemFoo)
      .leftOuterJoin(db.item)
      .on(db.itemFoo.itemId.eq(db.item.id));

    expect(rows).toHaveLength(0);
  });

  it(`should right outer join join`, async () => {
    const rows = await db
      .select(db.itemFoo.id, db.itemFoo.name, db.item.value)
      .from(db.itemFoo)
      .rightOuterJoin(db.item)
      .on(db.itemFoo.itemId.eq(db.item.id));

    expect(rows).toHaveLength(0);
  });

  it(`should full outer join`, async () => {
    const rows = await db
      .select(db.itemFoo.id, db.itemFoo.name, db.item.value)
      .from(db.itemFoo)
      .fullOuterJoin(db.item)
      .on(db.itemFoo.itemId.eq(db.item.id));

    expect(rows).toHaveLength(0);
  });

  it(`should full join`, async () => {
    const rows = await db
      .select(db.itemFoo.id, db.itemFoo.name, db.item.value)
      .from(db.itemFoo)
      .fullJoin(db.item)
      .on(db.itemFoo.itemId.eq(db.item.id));

    expect(rows).toHaveLength(0);
  });

  it(`should select count in subquery`, async () => {
    const result = await db
      .insertInto(db.item)
      .values({ name: `Test` })
      .returning(`id`);
    const { id: itemId } = result;

    await db.insertInto(db.itemFoo).values([
      {
        itemId,
        name: `A`,
      },
      {
        itemId,
        name: `B`,
      },
    ]);

    const [row] = await db
      .select(
        db.item.id,
        db
          .select(db.itemFoo.id.count())
          .from(db.itemFoo)
          .where(db.itemFoo.itemId.eq(db.item.id))
          .as(`test`),
      )
      .from(db.item);

    expect(row).toMatchInlineSnapshot(
      { id: expect.any(String) },
      `
      Object {
        "id": Any<String>,
        "test": "2",
      }
    `,
    );
  });
});
