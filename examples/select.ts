import { db } from './db';

const test = async () => {

const update = await db.update(db.test)
  .set({
    name: `Test 2`,
  })
  .where(db.test.name.eq(`Test`));

const rows = await db
  .insertInto(db.test)
  .values({
    id: null,
    createdAt: null,
    name: `My Test`,
    value: 123,
  })
  .returning(db.test.id);

rows.forEach(row => row.id);

const item = await db
  .select(db.test.id)
  .from(db.test)
  .limit(1)
  .first();

const anotherItem = await db
  .select(db.test.id)
  .from(db.test)
  .innerJoin(db.test).on(db.test.id)
  .first();

const ret = await db.transaction(async db => {
  await db
    .insertInto(db.test)
    .values({
      id: null,
      createdAt: new Date(),
      name: `Test :)`,
      value: 123,
    });

  return 123;
});


























};

test();