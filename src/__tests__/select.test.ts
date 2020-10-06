import {
  any,
  arrayAgg,
  avg,
  bitAnd,
  bitOr,
  boolAnd,
  boolOr,
  count,
  defineDb,
  defineTable,
  every,
  exists,
  group,
  integer,
  max,
  min,
  notExists,
  stringAgg,
  sum,
  text,
  timestampWithTimeZone,
  uuid,
} from '..';

import { toSnap } from './helpers';

describe(`select`, () => {
  const foo = defineTable({
    id: uuid().primaryKey().default(`gen_random_uuid()`),
    createDate: timestampWithTimeZone().notNull().default(`now()`),
    name: text().notNull(),
    value: integer(),
  });

  const bar = defineTable({
    id: uuid().primaryKey().default(`gen_random_uuid()`),
    fooId: uuid().notNull().references(foo, `id`),
    name: text(),
  });

  const listItem = defineTable({
    id: uuid().primaryKey().default(`gen_random_uuid()`),
    name: text().notNull(),
  });

  const db = defineDb({ foo, bar, listItem }, () =>
    Promise.resolve({ rows: [], affectedCount: 0 }),
  );

  it(`should select foo`, () => {
    const query = db.select(db.foo.id).from(db.foo);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id FROM foo",
      }
    `);
  });

  it(`should select camel case table`, () => {
    const query = db.select(db.listItem.id).from(db.listItem);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT list_item.id FROM list_item",
      }
    `);
  });

  it(`should select as camel case table`, () => {
    const test = db.foo.as(`testMe`);
    const query = db.select(test.id).from(test);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT \\"testMe\\".id FROM foo \\"testMe\\"",
      }
    `);
  });

  it(`should alias a column`, () => {
    const query = db.select(db.foo.id.as(`fooId`)).from(db.foo);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id \\"fooId\\" FROM foo",
      }
    `);
  });

  it(`should alias a table plus reference it in a condition `, () => {
    const baz = db.foo.as(`baz`);
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
    const query = db.select(db.foo.id, db.foo.value.plus(1).as(`test`)).from(db.foo);

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
    const query = db.select(db.foo.id, db.select(db.foo.value).from(db.foo)).from(db.foo);
    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id, (SELECT foo.value FROM foo) FROM foo",
      }
    `);
  });

  it(`should select where any`, () => {
    const query = db
      .select(db.foo.id)
      .from(db.foo)
      .where(db.foo.name.eq(any(['1', '2', '3'])));

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [
          Array [
            "1",
            "2",
            "3",
          ],
        ],
        "text": "SELECT foo.id FROM foo WHERE foo.name = ANY ($1)",
      }
    `);
  });

  it(`should select IN with subquery`, () => {
    const query = db
      .select(db.foo.id)
      .from(db.foo)
      .where(db.foo.id.in(db.select(db.foo.id).from(db.foo)));

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id FROM foo WHERE foo.id IN (SELECT foo.id FROM foo)",
      }
    `);
  });

  it(`should select in with delete subquery`, () => {
    const query = db
      .select(db.foo.id)
      .from(db.foo)
      .where(db.foo.id.in(db.deleteFrom(db.foo).returning(`id`)));

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id FROM foo WHERE foo.id IN (DELETE FROM foo RETURNING id)",
      }
    `);
  });

  it(`should select IN with array`, () => {
    const query = db
      .select(db.foo.id)
      .from(db.foo)
      .where(db.foo.name.in([`A`, `B`, `C`]));

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
      .select(db.foo.id)
      .from(db.foo)
      .where(db.foo.id.notIn(db.select(db.foo.id).from(db.foo)));

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id FROM foo WHERE foo.id NOT IN (SELECT foo.id FROM foo)",
      }
    `);
  });

  it(`should select NOT IN with array`, () => {
    const query = db
      .select(db.foo.id)
      .from(db.foo)
      .where(db.foo.name.notIn([`A`, `B`, `C`]));

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
    const query = db.select(db.foo.createDate).from(db.foo);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.create_date \\"createDate\\" FROM foo",
      }
    `);
  });

  it(`should select aggregate with as`, () => {
    const query = db.select(db.foo.id, sum(db.foo.value).as(`total`)).from(db.foo);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id, SUM (foo.value) \\"total\\" FROM foo",
      }
    `);
  });

  it(`should select min, max, avg`, () => {
    const query = db
      .select(db.foo.id, min(db.foo.value), max(db.foo.value), avg(db.foo.value))
      .from(db.foo);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id, MIN (foo.value), MAX (foo.value), AVG (foo.value) FROM foo",
      }
    `);
  });

  it(`should explicitly group`, () => {
    const query = db.select(db.foo.id).from(db.foo).where(group(db.foo.value.isNull()));

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id FROM foo WHERE (foo.value IS NULL)",
      }
    `);
  });

  it(`should select with in`, () => {
    const query = db.select(db.foo.id).where(db.foo.name.in([`A`, `B`, `C`]));

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
    const query = db.select(db.foo.id).orderBy(db.foo.name.asc().nullsFirst());

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id ORDER BY foo.name ASC NULLS FIRST",
      }
    `);
  });

  it(`should select with order by desc`, () => {
    const query = db.select(db.foo.id).orderBy(db.foo.name.desc().nullsLast());

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id ORDER BY foo.name DESC NULLS LAST",
      }
    `);
  });

  it(`should select with concat`, () => {
    const query = db.select(db.foo.name.concat(`!`)).from(db.foo);

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
    const query = db.select(db.foo.id).where(db.foo.value.isNotNull());

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id WHERE foo.value IS NOT NULL",
      }
    `);
  });

  it(`should basic math`, () => {
    const query = db
      .select(db.foo.id)
      .from(db.foo)
      .where(
        db.foo.value
          .plus(1)
          .multiply(2)
          .minus(3)
          .divide(4)
          .modulo(5)
          .between(-10, 10)
          .and(db.foo.value.betweenSymmetric(-20, 20)),
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
    const query = db.select(db.foo.id).from(db.foo).where(db.foo.createDate.isNotNull());

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id FROM foo WHERE foo.create_date IS NOT NULL",
      }
    `);
  });

  it(`should select aggregate on camel cased column`, () => {
    const query = db.select(count(db.foo.createDate)).from(db.foo);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT COUNT (foo.create_date) FROM foo",
      }
    `);
  });

  it(`should select arrayAgg`, () => {
    const query = db
      .select(arrayAgg(db.foo.name.orderBy(db.foo.name.desc())))
      .from(db.foo)
      .having(arrayAgg(db.foo.name).isNotNull());

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT array_agg (foo.name ORDER BY foo.name DESC) \\"arrayAgg\\" FROM foo HAVING array_agg (foo.name) IS NOT NULL",
      }
    `);
  });

  it(`should select stringAgg`, () => {
    const query = db.select(stringAgg(db.foo.name, '-', db.foo.name.desc())).from(db.foo);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [
          "-",
        ],
        "text": "SELECT string_agg (foo.name, $1 ORDER BY foo.name DESC) \\"stringAgg\\" FROM foo",
      }
    `);
  });

  it(`should select bitAnd, bitOr`, () => {
    const query = db.select(bitAnd(db.foo.value), bitOr(db.foo.value)).from(db.foo);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT bit_and (foo.value) \\"bitAnd\\", bit_or (foo.value) \\"bitOr\\" FROM foo",
      }
    `);
  });

  it(`should select aggregate with alias`, () => {
    const query = db.select(count(db.foo.createDate).as(`test`)).from(db.foo);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT COUNT (foo.create_date) \\"test\\" FROM foo",
      }
    `);
  });

  it(`should select join`, () => {
    const query = db.select(db.foo.id).from(db.foo).join(db.bar).on(db.foo.id.eq(db.bar.fooId));

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id FROM foo JOIN bar ON (foo.id = bar.foo_id)",
      }
    `);
  });

  it(`should select inner join`, () => {
    const query = db
      .select(db.foo.id)
      .from(db.foo)
      .innerJoin(db.bar)
      .on(db.foo.id.eq(db.bar.fooId));

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id FROM foo INNER JOIN bar ON (foo.id = bar.foo_id)",
      }
    `);
  });

  it(`should select left outer join`, () => {
    const query = db
      .select(db.foo.id)
      .from(db.foo)
      .leftOuterJoin(db.bar)
      .on(db.foo.id.eq(db.bar.fooId));

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id FROM foo LEFT OUTER JOIN bar ON (foo.id = bar.foo_id)",
      }
    `);
  });

  it(`should select left join`, () => {
    const query = db.select(db.foo.id).from(db.foo).leftJoin(db.bar).on(db.foo.id.eq(db.bar.fooId));

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id FROM foo INNER JOIN bar ON (foo.id = bar.foo_id)",
      }
    `);
  });

  it(`should select right outer join`, () => {
    const query = db.select(db.foo.id).from(db.foo).rightOuterJoin(db.bar).using(db.foo.id);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id FROM foo RIGHT OUTER JOIN bar USING (foo.id)",
      }
    `);
  });

  it(`should select right join`, () => {
    const query = db
      .select(db.foo.id)
      .from(db.foo)
      .rightJoin(db.bar)
      .on(db.foo.id.eq(db.bar.fooId));

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id FROM foo RIGHT JOIN bar ON (foo.id = bar.foo_id)",
      }
    `);
  });

  it(`should select full outer join`, () => {
    const query = db
      .select(db.foo.id)
      .from(db.foo)
      .fullOuterJoin(db.bar)
      .on(db.foo.id.eq(db.bar.fooId));

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id FROM foo FULL OUTER JOIN bar ON (foo.id = bar.foo_id)",
      }
    `);
  });

  it(`should select full join`, () => {
    const query = db.select(db.foo.id).from(db.foo).fullJoin(db.bar).on(db.foo.id.eq(db.bar.fooId));

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id FROM foo FULL JOIN bar ON (foo.id = bar.foo_id)",
      }
    `);
  });

  it(`should select cross join`, () => {
    const query = db.select(db.foo.id).from(db.foo).crossJoin(db.bar);

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id FROM foo CROSS JOIN bar",
      }
    `);
  });

  it(`should select for update of table nowait`, () => {
    const query = db.select(db.foo.id).from(db.foo).limit(1).forUpdate().of(db.foo).nowait();

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
    const query = db.select(db.foo.id).from(db.foo).limit(1).forNoKeyUpdate().skipLocked();

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
    const query = db.select(db.foo.id).from(db.foo).limit(1).forShare().skipLocked();

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
    const query = db.select(db.foo.id).from(db.foo).limit(1).forKeyShare().skipLocked();

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
    const query = db.select(db.foo.id).from(db.foo).groupBy(db.foo.name).having(count().gt(`1`));

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
    const query = db.select(db.foo.id).from(db.foo).limit(10).offset(10).fetch(5);

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
      .select(db.foo.id)
      .from(db.foo)
      .where(
        db.foo.name
          .isNull()
          .or(db.foo.name.eq(`Jane`).and(db.foo.name.eq(`Joe`)))
          .or(db.foo.value.gt(600)),
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

  it(`should select and exists`, () => {
    const query = db
      .select(db.foo.id)
      .from(db.foo)
      .where(
        exists(db.select(db.bar.id).where(db.bar.fooId.eq(db.foo.id))).andExists(
          db.select(db.foo.id).from(db.foo),
        ),
      );

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id FROM foo WHERE EXISTS (SELECT bar.id WHERE bar.foo_id = foo.id) AND EXISTS (SELECT foo.id FROM foo)",
      }
    `);
  });

  it(`should select and not exists`, () => {
    const query = db
      .select(db.foo.id)
      .from(db.foo)
      .where(
        notExists(
          db
            .select(db.bar.id)
            .where(db.bar.fooId.eq(db.foo.id).andNotExists(db.select(db.foo.id).from(db.foo))),
        ),
      );

    expect(toSnap(query)).toMatchInlineSnapshot(`
      Object {
        "parameters": Array [],
        "text": "SELECT foo.id FROM foo WHERE NOT EXISTS (SELECT bar.id WHERE bar.foo_id = foo.id AND NOT EXISTS (SELECT foo.id FROM foo))",
      }
    `);
  });
});
