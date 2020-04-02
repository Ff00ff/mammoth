import { createDatabase, UuidColumn, TextColumn, IntegerColumn, SerialColumn } from '../..';

class List {
  id = new UuidColumn()
    .notNull()
    .primaryKey()
    .default(`gen_random_uuid()`);
  name = new TextColumn().notNull();
}

class Item {
  id = new UuidColumn()
    .notNull()
    .primaryKey()
    .default(`gen_random_uuid()`);
  listId = new UuidColumn().notNull().references(() => db.list.id);
  name = new TextColumn().notNull();
  value = new IntegerColumn().null();
  s = new SerialColumn();
  string = new TextColumn();
}

const db = createDatabase(process.env.DATABASE_URL!, {
  list: new List(),
  item: new Item(),
});

export const main = async () => {
  const items = await db
    .select(db.item.id)
    .from(db.item)
    .innerJoin(db.list)
    .on(db.list.id.eq(db.item.listId))
    .limit(10);

  // TODO: value may be set to undefined or null
  await db
    .update(db.item)
    .set({ value: undefined })
    .where(db.item.value.ne(undefined));

  await db.insertInto(db.item).values({
    name: `Item #1`,
    listId: `Some list id`,
    value: undefined,
  });
};
