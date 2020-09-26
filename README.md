> This is `mammoth@next` which just had a major revamp. I'm about to publish a blog post with some more info. This will move to master soon.

![Mammoth](https://s3-eu-west-1.amazonaws.com/mammoth-static.ff00ff.nl/mammoth-logo.png)

# Mammoth: A type-safe Postgres query builder pur sang for TypeScript.

[![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fff00ff%2Fmammoth%2Fbadge%3Fref%3Dmaster&style=flat)](https://actions-badge.atrox.dev/ff00ff/mammoth/goto?ref=master)
[![Coverage Status](https://coveralls.io/repos/github/Ff00ff/mammoth/badge.svg?branch=master)](https://coveralls.io/github/Ff00ff/mammoth?branch=master)
[![MIT License](https://img.shields.io/github/license/ff00ff/mammoth.svg)](https://raw.githubusercontent.com/Ff00ff/mammoth/master/LICENSE)

```
npm i @ff00ff/mammoth@1.0.0-rc.1
```

<br/>

Mammoth is a type-safe query builder. It only supports Postgres which we consider a feature. It's syntax is as close to SQL as possible so you already know how to use it. It's autocomplete features are great. It helps you avoid mistakes so you can develop applications faster.

```ts
const rows = await db
  .select(foo.id, bar.name)
  .from(foo)
  .leftJoin(bar)
  .on(foo.barId.eq(bar.id))
  .where(foo.id.eq(`1`));
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
const updateCount = await db.update(foo).set({ name: `Test` }).where(foo.value.gt(0));
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
  .insertInto(foo)
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
  .insertInto(foo, ['name'])
  .select(bar.name)
  .from(bar)
  .where(bar.name.isNotNull());
```

</details>

---

<br/>

### Quick start

Mammoth is a query builder pur sang so it doesn't include a database driver. You need to create a db and pass a callback to execute the query.

```ts
import { defineDb } from '@ff00ff/mammoth';

const db = defineDb(async (query, parameters) => {
  const result = await pool.query(query, parameters);

  return {
    affectedRowCount: result.rowCount,
    rows: result.rows,
  };
});
```

To

```ts
const foo = defineTable(`foo`, {
  id: uuid().primaryKey().default(`gen_random_id()`),
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

- [ WITH [ RECURSIVE ] with_query [, ...] ] — Not supported yet
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

- [ WITH [ RECURSIVE ] with_query [, ...] ] — not supported yet.
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

- [ WITH [ RECURSIVE ] with_query [, ...] ] — not supported yet
- DELETE FROM [ ONLY ] table_name [ * ] [ [ AS ] alias ] — supported
- [ USING from_item [, ...] ] — supported
- [ WHERE condition | WHERE CURRENT OF cursor_name ] — supported, but the condition concept is very broad and might be incomplete
- [ RETURNING \* | output_expression [ [ AS ] output_name ] [, ... ] ] — supported, but up to 10 expressions
</details>

<details>
  <summary>INSERT</summary>

- [ WITH [ RECURSIVE ] with_query [, ...] ] — not supported
- INSERT INTO table_name [ AS alias ] [ ( column_name [, ...] ) ] — supported
- [ OVERRIDING { SYSTEM | USER } VALUE ] — not supported
- { DEFAULT VALUES | VALUES ( { expression | DEFAULT } [, ...] ) [, ...] | query } - supported, but expression is a broad concept and may not be complete
- [ ON CONFLICT [ conflict_target ] conflict_action ] — supported
- [ RETURNING \* | output_expression [ [ AS ] output_name ] [, ...] ] — supported, but limited to 10 expressions
</details>

### Column data type

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

Once you clone the repo, do a `npm install` you should be able to run `npm test` seeing everything turn green. Feel free to pick up one of the open issues — in particular you can pick up one labeled with "good first issue". Be sure to claim the issue before you start so we avoid two or more people working on the same thing.

---

##### Mammoth logo created by Eucalyp from the Noun Project.
