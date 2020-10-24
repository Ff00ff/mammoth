![Mammoth](https://s3-eu-west-1.amazonaws.com/mammoth-static.ff00ff.nl/mammoth-logo.png)

# Mammoth: A type-safe Postgres query builder pur sang for TypeScript

[![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fff00ff%2Fmammoth%2Fbadge%3Fref%3Dmaster&style=flat)](https://actions-badge.atrox.dev/ff00ff/mammoth/goto?ref=master)
[![Coverage Status](https://coveralls.io/repos/github/Ff00ff/mammoth/badge.svg?branch=master)](https://coveralls.io/github/Ff00ff/mammoth?branch=master)
[![MIT License](https://img.shields.io/github/license/ff00ff/mammoth.svg)](https://raw.githubusercontent.com/Ff00ff/mammoth/master/LICENSE)

📖 Work-in-progress documentation site is available at https://mammoth.tools/.

```
npm i @ff00ff/mammoth@1.0.0-rc.9
```

Mammoth is a type-safe query builder. It only supports Postgres which we consider a feature. It's syntax is as close to SQL as possible so you already know how to use it. It's autocomplete features are great. It helps you avoid mistakes so you can develop applications faster.

```ts
const rows = await db
  .select(db.foo.id, db.bar.name)
  .from(db.foo)
  .leftJoin(db.bar)
  .on(db.foo.barId.eq(db.bar.id))
  .where(db.foo.id.eq(`1`));
```

The above query produces the following SQL:

```sql
SELECT
  foo.id,
  bar.name
FROM foo
LEFT JOIN bar ON (foo.bar_id = bar.id)
WHERE
  foo.id = $1
```

More importantly, the resulting type of rows is `{ id: string; name: string | undefined }[]`. Notice how the name is automatically nullable because of the left join.

### Query examples

<details>
  <summary>Basic update</summary>

```ts
const updateCount = await db.update(db.foo).set({ name: `Test` }).where(db.foo.value.gt(0));
```

```sql
UPDATE foo
SET
  name = $1
WHERE
  value > $2
```

</details>

<details>
  <summary>Basic insert</summary>

```ts
const rows = await db
  .insertInto(db.foo)
  .values({
    name: `Test`,
    value: 123,
  })
  .returning(`id`);
```

```sql
INSERT INTO foo (
  name,
  value
) VALUES (
  $1,
  $2
)
RETURNING
  id
```

</details>

<details>
  <summary>Insert into select</summary>

```ts
const affectedCount = await db
  .insertInto(db.foo, ['name'])
  .select(db.bar.name)
  .from(db.bar)
  .where(db.bar.name.isNotNull());
```

```sql
INSERT INTO foo (name)
SELECT
  bar.name
FROM bar
WHERE
  bar.name IS NOT NULL
```

</details>

<details>
  <summary>Select with count(*)</summary>

```ts
db.select(count()).from(db.foo);
```

```sql
SELECT COUNT(*) FROM foo
```

</details>

<details>
  <summary>Select with aggregate expression</summary>

```ts
db.select(arrayAgg(db.foo.name.orderBy(db.foo.name.desc()))).from(db.foo);
```

```sql
SELECT array_agg(foo.name ORDER BY foo.name DESC) "arrayAgg" FROM foo
```

</details>

<details>
  <summary>With (CTE) query</summary>

```ts
db.with(
  `regionalSales`,
  () =>
    db
      .select(db.orderLog.region, sum(db.orderLog.amount).as(`totalSales`))
      .from(db.orderLog)
      .groupBy(db.orderLog.region),
  `topRegions`,
  ({ regionalSales }) =>
    db
      .select(regionalSales.region)
      .from(regionalSales)
      .where(
        regionalSales.totalSales.gt(
          db.select(sum(regionalSales.totalSales).divide(10)).from(regionalSales),
        ),
      ),
  ({ topRegions }) =>
    db
      .select(
        db.orderLog.region,
        db.orderLog.product,
        sum(db.orderLog.quantity).as(`productUnits`),
        sum(db.orderLog.amount).as(`productSales`),
      )
      .from(db.orderLog)
      .where(db.orderLog.region.in(db.select(topRegions.region).from(topRegions)))
      .groupBy(db.orderLog.region, db.orderLog.product),
);
```

```sql
WITH "regionalSales" AS (SELECT order_log.region, SUM (order_log.amount) "totalSales" FROM order_log GROUP BY order_log.region), "topRegions" AS (SELECT "regionalSales".region FROM "regionalSales" WHERE "regionalSales"."totalSales" > (SELECT SUM ("regionalSales"."totalSales") / $1 FROM "regionalSales")) SELECT order_log.region, order_log.product, SUM (order_log.quantity) "productUnits", SUM (order_log.amount) "productSales" FROM order_log WHERE order_log.region IN (SELECT "topRegions".region FROM "topRegions") GROUP BY order_log.region, order_log.product
```

</details>

---

<br/>

### Quick start

Mammoth is a query builder pur sang so it doesn't include a database driver. You need to create a db and pass a callback to execute the query.

```ts
import { defineDb } from '@ff00ff/mammoth';
import { foo, bar } from './tables';

const db = defineDb({ foo, bar }, async (query, parameters) => {
  const result = await pool.query(query, parameters);

  return {
    affectedCount: result.rowCount,
    rows: result.rows,
  };
});
```

In the `defineDb` call you pass all your tables so they can be access through the db instance. You have to define all the tables to make sure Mammoth understands the type information. This should be close to the CREATE TABLE syntax.

```ts
const foo = defineTable({
  id: uuid().primaryKey().default(`gen_random_uuid()`),
  createDate: timestampWithTimeZone().notNull().default(`now()`),
  name: text().notNull(),
  value: integer(),
});
```

> You should keep your column names camelCase in the defineTable call as they are automatically transformed to train_case throughout Mammoth.

## Compatibility

Below is a list of clauses per query and a short description on what we Mammoth supports.

<details>
  <summary>SELECT</summary>

- [ WITH [ RECURSIVE ] with_query [, ...] ] — Partial support. Recursive not supported yet.
- SELECT [ ALL | DISTINCT [ ON ( expression [, ...] ) ] ] — Mostly supported. Distinct not yet.
- [ \* | expression [ [ AS ] output_name ] [, ...] ] — mostly supported. Selecting certain expressions like update queries, insert and delete queries are not supported yet. Select queries are though.
- [ FROM from_item [, ...] ] — partially supported. Only 1 table is currently supported in the from.
- [ WHERE condition ] — mostly supported. The condition concept is pretty broad but it should contain a lot of cases.
- [ GROUP BY grouping_element [, ...] ] — supported.
- [ HAVING condition [, ...] ] — supported.
- [ WINDOW window_name AS ( window_definition ) [, ...] ] — not supported.
- [ { UNION | INTERSECT | EXCEPT } [ ALL | DISTINCT ] select ] — not supported yet
- [ ORDER BY expression [ ASC | DESC | USING operator ] [ NULLS { FIRST | LAST } ] [, ...] ] — supported, but expressions are pretty broad and there might be cases not covered yet.
- [ LIMIT { count | ALL } ] — supported.
- [ OFFSET start [ ROW | ROWS ] ] — supported.
- [ FETCH { FIRST | NEXT } [ count ] { ROW | ROWS } ONLY ] — supported
- [ FOR { UPDATE | NO KEY UPDATE | SHARE | KEY SHARE } [ OF table_name [, ...] ] [ NOWAIT | SKIP LOCKED ] [...] ] — supported

</details>

<details>
  <summary>UPDATE</summary>

- [ WITH [ RECURSIVE ] with_query [, ...] ] — Partial support. Recursive not supported yet.
- UPDATE [ ONLY ] table_name [ * ] [ [ AS ] alias ] — supported
- SET { column_name = { expression | DEFAULT } | — supported, but expression concept is very broad and might be incomplete
- ( column_name [, ...] ) = [ ROW ] ( { expression | DEFAULT } [, ...] ) | — supported, but expression concept is very broad and might be incomplete in some cases
- ( column_name [, ...] ) = ( sub-SELECT ) — not supported
- } [, ...]
- [ FROM from_item [, ...] ] — partially supported. Only 1 table as from item is supported
- [ WHERE condition | WHERE CURRENT OF cursor_name ] — supported, but the condition concept is very broad and is incomplete in some cases.
- [ RETURNING \* | output_expression [ [ AS ] output_name ] [, ...] ] — supported, but up to 10 expressions

</details>

<details>
  <summary>DELETE</summary>

- [ WITH [ RECURSIVE ] with_query [, ...] ] — Partial support. Recursive not supported yet.
- DELETE FROM [ ONLY ] table_name [ * ] [ [ AS ] alias ] — supported
- [ USING from_item [, ...] ] — supported
- [ WHERE condition | WHERE CURRENT OF cursor_name ] — supported, but the condition concept is very broad and might be incomplete
- [ RETURNING \* | output_expression [ [ AS ] output_name ] [, ... ] ] — supported, but up to 10 expressions
</details>

<details>
  <summary>INSERT</summary>

- [ WITH [ RECURSIVE ] with_query [, ...] ] — Partial support. Recursive not supported yet.
- INSERT INTO table_name [ AS alias ] [ ( column_name [, ...] ) ] — supported
- [ OVERRIDING { SYSTEM | USER } VALUE ] — not supported
- { DEFAULT VALUES | VALUES ( { expression | DEFAULT } [, ...] ) [, ...] | query } - supported, but expression is a broad concept and may not be complete
- [ ON CONFLICT [ conflict_target ] conflict_action ] — supported
- [ RETURNING \* | output_expression [ [ AS ] output_name ] [, ...] ] — supported, but limited to 10 expressions
</details>

### Column data type

This is a list of all the data types and it's companioning data type function.

| Function                   | SQL data type               |
| -------------------------- | --------------------------- |
| binary()                   | BYTEA                       |
| blob()                     | BYTEA                       |
| bytea()                    | BYTEA                       |
| caseInsensitiveText()      | CITEXT                      |
| citext()                   | CITEXT                      |
| date()                     | DATE                        |
| decimal()                  | DECIMAL                     |
| integer()                  | INTEGER                     |
| interval()                 | INTERVAL                    |
| jsonb\<T>()                | JSONB                       |
| json\<T>()                 | JSON                        |
| money()                    | MONEY                       |
| number()                   | IntegerColumn               |
| serial()                   | SERIAL                      |
| string()                   | TextColumn                  |
| text()                     | TEXT                        |
| text\<T>()                 | TEXT                        |
| time()                     | TIME                        |
| timestamp()                | TIMESTAMP                   |
| timestampWithoutTimeZone() | TIMESTAMP WITHOUT TIME ZONE |
| timestampWithTimeZone()    | TIMESTAMP WITH TIME ZONE    |
| timeWithoutTimeZone()      | TIME WITHOUT TIME ZONE      |
| timeWithTimeZone()         | TIME WITH TIME ZONE         |
| uuid()                     | UUID                        |

## Contribute

Once you clone the repo, do a `npm install` + `npm run build`. Now you should be able to run `npm test` seeing everything turn green. Feel free to pick up one of the open issues — in particular you can pick up one labeled with "good first issue". Be sure to claim the issue before you start so we avoid two or more people working on the same thing.

---

##### Mammoth logo created by Eucalyp from the Noun Project.
