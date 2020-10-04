import { defineDb, defineTable, integer, text, timestampWithTimeZone, uuid } from '..';

import { toSnap } from './helpers';

describe(`delete`, () => {
  const foo = defineTable({
    id: uuid().primaryKey().default(`gen_random_uuid()`),
    createDate: timestampWithTimeZone().notNull().default(`now()`),
    name: text().notNull(),
    value: integer(),
  });

  const bar = defineTable({
    id: uuid().primaryKey().default(`gen_random_uuid()`),
  });

  const baz = defineTable({
    id: uuid().primaryKey().default(`gen_random_uuid()`),
  });

  const db = defineDb(
    {
      foo,
      bar,
      baz,
    },
    () => Promise.resolve({ rows: [], affectedCount: 0 }),
  );

  it(`should delete`, () => {
    const query = db
      .deleteFrom(db.foo)
      .using(db.bar, db.baz)
      .where(db.foo.id.ne(db.bar.id))
      .returning(`id`, `name`, `createDate`);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "DELETE FROM foo USING bar, baz WHERE foo.id <> bar.id RETURNING id, name, create_date \\"createDate\\"",
      }
    `);
  });
});
