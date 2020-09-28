import {
  any,
  avg,
  count,
  defineDb,
  defineTable,
  group,
  integer,
  max,
  min,
  sum,
  text,
  timestampWithTimeZone,
  uuid,
} from '..';

import { toSnap } from './helpers';

describe(`select`, () => {
  const foo = defineTable(`foo`, {
    id: uuid().primaryKey().default(`gen_random_id()`),
    createDate: timestampWithTimeZone().notNull().default(`now()`),
    name: text().notNull(),
    value: integer(),
  });

  const bar = defineTable(`bar`, {
    id: uuid().primaryKey().default(`gen_random_id()`),
    fooId: uuid().notNull().references(foo, `id`),
    name: text(),
  });

  const db = defineDb(() => Promise.resolve({ rows: [], affectedRowsCount: 0 }));

  it(`should select foo`, () => {
    const query = db.select(foo.id).from(foo);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id FROM foo",
      }
    `);
  });

  it(`should alias a column`, () => {
    const query = db.select(foo.id.as(`fooId`)).from(foo);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id \\"fooId\\" FROM foo",
      }
    `);
  });

  it(`should alias a table plus reference it in a condition `, () => {
    const baz = foo.as(`baz`);
    const query = db.select(baz.id).from(baz).where(baz.value.eq(1));

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [
          1,
        ],
        "text": "SELECT baz.id FROM foo \\"baz\\" WHERE baz.value = $1",
      }
    `);
  });

  it(`should plus a column as expression`, () => {
    const query = db.select(foo.id, foo.value.plus(1).as(`test`)).from(foo);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [
          1,
        ],
        "text": "SELECT foo.id, (foo.value + $1) \\"test\\" FROM foo",
      }
    `);
  });

  it(`should select subquery`, () => {
    const query = db.select(foo.id, db.select(foo.value).from(foo)).from(foo);
    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id, (SELECT foo.value FROM foo) FROM foo",
      }
    `);
  });

  it(`should select IN with subquery`, () => {
    const query = db
      .select(foo.id)
      .from(foo)
      .where(foo.id.in(db.select(foo.id).from(foo)));

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id FROM foo WHERE foo.id IN (SELECT foo.id FROM foo)",
      }
    `);
  });

  it(`should select IN with array`, () => {
    const query = db
      .select(foo.id)
      .from(foo)
      .where(foo.name.in([`A`, `B`, `C`]));

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [
          "A",
          "B",
          "C",
        ],
        "text": "SELECT foo.id FROM foo WHERE foo.name IN ($1, $2, $3)",
      }
    `);
  });

  it(`should select NOT IN with subquery`, () => {
    const query = db
      .select(foo.id)
      .from(foo)
      .where(foo.id.notIn(db.select(foo.id).from(foo)));

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id FROM foo WHERE foo.id NOT IN (SELECT foo.id FROM foo)",
      }
    `);
  });

  it(`should select NOT IN with array`, () => {
    const query = db
      .select(foo.id)
      .from(foo)
      .where(foo.name.notIn([`A`, `B`, `C`]));

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [
          "A",
          "B",
          "C",
        ],
        "text": "SELECT foo.id FROM foo WHERE foo.name NOT IN ($1, $2, $3)",
      }
    `);
  });

  it(`should convert column to snake case`, () => {
    const query = db.select(foo.createDate).from(foo);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.create_date \\"createDate\\" FROM foo",
      }
    `);
  });

  it(`should select aggregate with as`, () => {
    const query = db.select(foo.id, sum(foo.value).as(`total`)).from(foo);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id, SUM (foo.value) \\"total\\" FROM foo",
      }
    `);
  });

  it(`should select min, max, avg`, () => {
    const query = db.select(foo.id, min(foo.value), max(foo.value), avg(foo.value)).from(foo);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id, MIN (foo.value), MAX (foo.value), AVG (foo.value) FROM foo",
      }
    `);
  });

  it(`should explicitly group`, () => {
    const query = db.select(foo.id).from(foo).where(group(foo.value.isNull()));

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id FROM foo WHERE (foo.value IS NULL)",
      }
    `);
  });

  it(`should select with in`, () => {
    const query = db.select(foo.id).where(foo.name.in([`A`, `B`, `C`]));

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [
          "A",
          "B",
          "C",
        ],
        "text": "SELECT foo.id WHERE foo.name IN ($1, $2, $3)",
      }
    `);
  });

  it(`should select with order by`, () => {
    const query = db.select(foo.id).orderBy(foo.name.asc().nullsFirst());

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id ORDER BY foo.name ASC NULLS FIRST",
      }
    `);
  });

  it(`should select with order by desc`, () => {
    const query = db.select(foo.id).orderBy(foo.name.desc().nullsLast());

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id ORDER BY foo.name DESC NULLS LAST",
      }
    `);
  });

  it(`should select with concat`, () => {
    const query = db.select(foo.name.concat(`!`)).from(foo);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [
          "!",
        ],
        "text": "SELECT foo.name || $1 FROM foo",
      }
    `);
  });

  it(`should select where is not null`, () => {
    const query = db.select(foo.id).where(foo.value.isNotNull());

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id WHERE foo.value IS NOT NULL",
      }
    `);
  });

  it(`should basic math`, () => {
    const query = db
      .select(foo.id)
      .from(foo)
      .where(
        foo.value
          .plus(1)
          .multiply(2)
          .minus(3)
          .divide(4)
          .modulo(5)
          .between(-10, 10)
          .and(foo.value.betweenSymmetric(-20, 20)),
      );

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [
          1,
          2,
          3,
          4,
          5,
          -10,
          10,
          -20,
          20,
        ],
        "text": "SELECT foo.id FROM foo WHERE foo.value + $1 * $2 - $3 / $4 % $5 BETWEEN $6 AND $7 AND (foo.value BETWEEN SYMMETRIC $8 AND $9)",
      }
    `);
  });

  it(`should select camel cased`, () => {
    const query = db.select(foo.id).from(foo).where(foo.createDate.isNotNull());

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id FROM foo WHERE foo.create_date IS NOT NULL",
      }
    `);
  });

  it(`should select aggregate on camel cased column`, () => {
    const query = db.select(count(foo.createDate)).from(foo);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT COUNT (foo.create_date) FROM foo",
      }
    `);
  });

  it(`should select aggregate with alias`, () => {
    const query = db.select(count(foo.createDate).as(`test`)).from(foo);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT COUNT (foo.create_date) \\"test\\" FROM foo",
      }
    `);
  });

  it(`should select join`, () => {
    const query = db.select(foo.id).from(foo).join(bar).on(foo.id.eq(bar.fooId));

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id FROM foo JOIN bar ON (foo.id = bar.foo_id)",
      }
    `);
  });

  it(`should select inner join`, () => {
    const query = db.select(foo.id).from(foo).innerJoin(bar).on(foo.id.eq(bar.fooId));

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id FROM foo INNER JOIN bar ON (foo.id = bar.foo_id)",
      }
    `);
  });

  it(`should select left outer join`, () => {
    const query = db.select(foo.id).from(foo).leftOuterJoin(bar).on(foo.id.eq(bar.fooId));

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id FROM foo LEFT OUTER JOIN bar ON (foo.id = bar.foo_id)",
      }
    `);
  });

  it(`should select left join`, () => {
    const query = db.select(foo.id).from(foo).leftJoin(bar).on(foo.id.eq(bar.fooId));

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id FROM foo INNER JOIN bar ON (foo.id = bar.foo_id)",
      }
    `);
  });

  it(`should select right outer join`, () => {
    const query = db.select(foo.id).from(foo).rightOuterJoin(bar).using(foo.id);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id FROM foo RIGHT OUTER JOIN bar USING (foo.id)",
      }
    `);
  });

  it(`should select right join`, () => {
    const query = db.select(foo.id).from(foo).rightJoin(bar).on(foo.id.eq(bar.fooId));

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id FROM foo RIGHT JOIN bar ON (foo.id = bar.foo_id)",
      }
    `);
  });

  it(`should select full outer join`, () => {
    const query = db.select(foo.id).from(foo).fullOuterJoin(bar).on(foo.id.eq(bar.fooId));

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id FROM foo FULL OUTER JOIN bar ON (foo.id = bar.foo_id)",
      }
    `);
  });

  it(`should select full join`, () => {
    const query = db.select(foo.id).from(foo).fullJoin(bar).on(foo.id.eq(bar.fooId));

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id FROM foo FULL JOIN bar ON (foo.id = bar.foo_id)",
      }
    `);
  });

  it(`should select cross join`, () => {
    const query = db.select(foo.id).from(foo).crossJoin(bar);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id FROM foo CROSS JOIN bar",
      }
    `);
  });

  it(`should select for update of table nowait`, () => {
    const query = db.select(foo.id).from(foo).limit(1).forUpdate().of(foo).nowait();

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [
          1,
        ],
        "text": "SELECT foo.id FROM foo LIMIT $1 FOR UPDATE OF foo NOWAIT",
      }
    `);
  });

  it(`should select for no key update skip locked`, () => {
    const query = db.select(foo.id).from(foo).limit(1).forNoKeyUpdate().skipLocked();

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [
          1,
        ],
        "text": "SELECT foo.id FROM foo LIMIT $1 FOR NO KEY UPDATE SKIP LOCKED",
      }
    `);
  });

  it(`should select for share`, () => {
    const query = db.select(foo.id).from(foo).limit(1).forShare().skipLocked();

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [
          1,
        ],
        "text": "SELECT foo.id FROM foo LIMIT $1 FOR SHARE SKIP LOCKED",
      }
    `);
  });

  it(`should select for key share`, () => {
    const query = db.select(foo.id).from(foo).limit(1).forKeyShare().skipLocked();

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [
          1,
        ],
        "text": "SELECT foo.id FROM foo LIMIT $1 FOR KEY SHARE SKIP LOCKED",
      }
    `);
  });

  it(`should select group by having count(*) > 1`, () => {
    const query = db.select(foo.id).from(foo).groupBy(foo.name).having(count().gt(`1`));

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [
          "1",
        ],
        "text": "SELECT foo.id FROM foo GROUP BY foo.name HAVING COUNT(*) > $1",
      }
    `);
  });

  it(`should select limit-offset-fetch`, () => {
    const query = db.select(foo.id).from(foo).limit(10).offset(10).fetch(5);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [
          10,
          10,
          5,
        ],
        "text": "SELECT foo.id FROM foo LIMIT $1 OFFSET $2 FETCH FIRST $3 ROWS ONLY",
      }
    `);
  });

  it(`should select with right and or grouping`, () => {
    const query = db
      .select(foo.id)
      .from(foo)
      .where(
        foo.name
          .isNull()
          .or(foo.name.eq(`Jane`).and(foo.name.eq(`Joe`)))
          .or(foo.value.gt(600)),
      );

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [
          "Jane",
          "Joe",
          600,
        ],
        "text": "SELECT foo.id FROM foo WHERE foo.name IS NULL OR (foo.name = $1 AND foo.name = $2) OR foo.value > $3",
      }
    `);
  });
});
