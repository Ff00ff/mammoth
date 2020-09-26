import {
  defineDb,
  defineTable,
  integer,
  text,
  timestampWithTimeZone,
  uuid,
} from "..";

import { toSnap } from "./helpers";

describe(`delete`, () => {
  const foo = defineTable(`foo`, {
    id: uuid().primaryKey().default(`gen_random_id()`),
    createDate: timestampWithTimeZone().notNull().default(`now()`),
    name: text().notNull(),
    value: integer(),
  });

  const bar = defineTable(`bar`, {
    id: uuid().primaryKey().default(`gen_random_id()`),
  });

  const baz = defineTable(`baz`, {
    id: uuid().primaryKey().default(`gen_random_id()`),
  });

  const db = defineDb(() =>
    Promise.resolve({ rows: [], affectedRowsCount: 0 })
  );

  it(`should delete`, () => {
    const query = db
      .deleteFrom(foo)
      .using(bar, baz)
      .where(foo.id.ne(bar.id))
      .returning(`id`, `name`, `createDate`);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "DELETE FROM foo USING bar, baz WHERE foo.id <> bar.id RETURNING id, name, create_date \\"createDate\\"",
      }
    `);
  });
});
