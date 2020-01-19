import { db } from './db';

const main = async () => {
  const { select, deleteFrom, insertInto, test } = db;

  const row = await select(test.id)
    .from(test)
    .where(test.id.eq(`1234`))
    .first();

  await db
    .insertInto(db.test)
    .values({
      name: `My Name`,
    })
    .returning(`id`);

  const update = await db
    .update(db.test)
    .set({
      name: `Test 2`,
    })
    .where(db.test.name.eq(`Test`))
    .returning(`id`);

  // TODO: this should return an array
  const rows = await db
    .insertInto(db.test)
    .values([
      {
        name: `My Test`,
        value: 123,
      },
      {
        name: `My Test #2`,
      },
    ])
    .returning(db.test.id);

  // rows.forEach(row => row.id);

  // TODO: this should be an object or undefined
  const item = await db
    .select(db.test.id)
    .from(db.test)
    .limit(1)
    .first();

  const items = await db
    .select(db.test.id)
    .from(db.test)
    .innerJoin(db.test)
    .on(db.test.id);
  const test = items[0];

  await db.insertInto(db.testWithTypedText).values({
    value: `FOO`,
  });

  await db.select(db.testWithTypedText.value).from(db.testWithTypedText);

  const ret = await db.transaction(async db => {
    await db.insertInto(db.test).values({
      id: null,
      createdAt: new Date(),
      name: `Test :)`,
      value: 123,
    });

    return 123;
  });
};

main();
