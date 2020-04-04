> This is `mammoth@next` which is available as beta in npm only. Switch to [mammoth@master](https://github.com/Ff00ff/mammoth/tree/master) to see the latest non-beta version.

![Mammoth](https://s3-eu-west-1.amazonaws.com/mammoth-static.ff00ff.nl/mammoth-logo.png)

# Mammoth: A type-safe Postgres query builder for TypeScript.

[![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fff00ff%2Fmammoth%2Fbadge%3Fref%3Dnext&style=flat)](https://actions-badge.atrox.dev/ff00ff/mammoth/goto?ref=next)
[![Coverage Status](https://coveralls.io/repos/github/Ff00ff/mammoth/badge.svg?branch=next)](https://coveralls.io/github/Ff00ff/mammoth?branch=next)
[![MIT License](https://img.shields.io/github/license/ff00ff/mammoth.svg)](https://raw.githubusercontent.com/Ff00ff/mammoth/master/LICENSE)

```
npm i @ff00ff/mammoth@1.0.0-beta.9
```

<br/>

Mammoth is a type-safe query builder. It only supports Postgres which we consider a feature. It's syntax is as close to SQL as possible so you already know how to use it. It's autocomplete features are great. It helps you avoid mistakes so you can develop applications faster. It comes with all features you need to create production ready apps.

```ts
const rows = await db
  .select(db.list.id, db.list.createdAt)
  .from(db.list)
  .where(db.list.createdAt.gt(now().minus(days(2))).or(db.list.value.eq(0)))
  .limit(10);
```

---

## Features

- Type-safe query builder
- Supports Postgres only
- Excellent autocomplete
- Transactions
- Connection pooling
- Automatic camelCase to/from snake_case conversion
- No build step or watch needed

---

<br/>

### Quick start

First of all it's important to define your schema. This means you have to define all your tables.

```ts
import mammoth from '@ff00ff/mammoth';

export const list = mammoth.defineTable({
  id: mammoth
    .uuid()
    .primary()
    .notNull()
    .default(`gen_random_uuid()`),
  createdAt: mammoth
    .timestamptz()
    .notNull()
    .default(`now()`),
  name: mammoth.text().notNull(),
  value: mammoth.integer(),
});
```

> For now, it's only possible to define tables. But in the future you'll be able to define other types likes indices, functions, triggers, etc.

Once your tables are defined you can create your database instance where you pass in all your tables.

```ts
import mammoth from '@ff00ff/mammoth';

export const db = mammoth.createDatabase(process.env.DATABASE_URL!, {
  list,
});
```

Using your database instance you can access Mammoth's type safe query builder. Your db instance is a singleton which you can share throughout your app.

```ts
const rows = await db
  .select(db.list.id, db.list.createdAt)
  .from(db.list)
  .where(db.list.createdAt.gt(now().minus(days(2))).or(db.list.value.eq(0)))
  .limit(10);
```

```sql
SELECT list.id, list.created_at FROM list WHERE list.created_at > NOW() - $1::interval OR list.value = $2 LIMIT 10;
```

_A select should not require declaring an additional interface explicitly._

The type of rows is automatically derived from the table. `.notNull()` columns are automatically required and the other columns are all optional.

```ts
const rows: {
  id: string;
  createdAt: Date;
}[];
```

### Update

When executing an update query, by default, the return type is `number` which indicates the number of affected rows.

```ts
const numberOfUpdates = await db
  .update(db.list)
  .set({
    name: `New Name`,
  })
  .where(db.list.id.eq(`acb82ff3-3311-430e-9d1d-8ff600abee31`));
```

```sql
UPDATE list SET name = $1 WHERE list.id = $2
```

But when you use `.returning(..)` the return type is changed to an array of rows.

```ts
// { id: string }[]
const rows = await db
  .update(db.list)
  .set({
    name: `New Name`,
  })
  .where(db.list.id.eq(`acb82ff3-3311-430e-9d1d-8ff600abee31`))
  .returning(`id`);
```

```sql
UPDATE list SET name = $1 WHERE list.id = $2 RETURNING id
```

### Insert

To insert a row you only have to specify the `.notNull()` without a `.default()`. The other columns are optional.

```ts
const numberOfRows = await db.insertInto(db.list).values({
  name: `My List`,
});
```

```sql
INSERT INTO list (name) VALUES ($1)
```

> In an earlier version of Mammoth you still had to pass `undefined` for nullable columns, but with some type magic this is now fixed!

Again, if you use `.returning(..)` the return type is changed automatically.

```ts
// { id: string, createdAt: Date, name: string }
const list = await db
  .insertInto(db.list)
  .values({
    name: `My List`,
  })
  .returning(`id`, `createdAt`, `name`);
```

```sql
INSERT INTO list (name) VALUES ($1) RETURNING id, created_at, name
```

If you insert an array of rows and you use the `.returning(..)` the return type will change to an array as well.

```ts
// { id: string, createdAt: Date, name: string }[]
const lists = await db
  .insertInto(db.list)
  .values([
    {
      name: `List #1`,
    },
    {
      name: `List #2`,
    },
  ])
  .returning(`id`, `createdAt`, `name`);
```

```sql
INSERT INTO list (name) VALUES ($1), ($2) RETURNING id, created_at, name;
```

### Transactions

You can call `transaction(callback)` which begins a transaction and depending on the promise you return in the transaction will commit or rollback the transaction.

It's important you use the `db` passed in the transaction's callback, if not, you're effectively executing statements outside the transaction.

```ts
const result = await db.transaction(db => {
  const row = await db
    .insertInto(db.list)
    .values({
      name: `My List`,
    })
    .returning(`id`);

  await db.insertInto(db.listItem).values({
    listId: row.id,
    name: `My Item`,
  });

  return row;
});
```

### Schema

Before Mammoth can offer type safety features you have to define the schema in Mammoth's syntax. The syntax is designed to be as close to SQL as possible.

```ts
import mammoth from '@ff00ff/mammoth';

export const list = mammoth.defineTable({
  id: mammoth.dataType(`UUID`).primary().notNull().default(`gen_random_uuid()`);
  createdAt = mammoth.dataType<Date>(`TIMESTAMP WITH TIME ZONE`).notNull().default(`NOW()`);
  name = mammoth.dataType(`TEXT`).notNull();
  value = mammoth.dataType<number>(`INTEGER`);
})
```

But to make things easier, there are data type specific functions. When using auto import this should be a breeze.

```ts
import mammoth from '@ff00ff/mammoth';

export const list = mammoth.defineTable({
  id: mammoth
    .uuid()
    .primary()
    .notNull()
    .default(`gen_random_uuid()`),
  createdAt: mammoth
    .timestampWithTimeZone()
    .notNull()
    .default(`NOW()`),
  name: mammoth.text().notNull(),
  value: mammoth.integer(),
});

export const listItem = mammoth.defineTable({
  id: mammoth
    .uuid()
    .primary()
    .notNull()
    .default(`gen_random_uuid()`),
  createdAt: mammoth
    .timestampWithTimeZone()
    .notNull()
    .default(`now()`),
  listId: mammoth
    .uuid()
    .notNull()
    .references(list, 'id'),
  name: mammoth.text().notNull(),
});
```

Which matches the below schema in SQL.

```sql
CREATE TABLE list (
  id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  value INTEGER
);

CREATE TABLE list_item (
  id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  list_id UUID NOT NULL REFERENCES list (id),
  name TEXT NOT NULL
);
```

> We want to avoid a build step (even if there is some smart watch going on) so the schema must be defined in TypeScript.

### Migrations

The accompanying `mammoth-cli` helps you generate migrations based on your schema and existing migrations.

### Raw queries

When a new keyword is introduced in Postgres which you want to use badly but is not supported in this library yet, you can always fall back to raw sql. You can mix the type-safe functions with raw sql:

```ts
db.select(db.list.id).from(db.list).append`MAGIC NEW ORDER BY`;
```

```sql
SELECT list.id FROM list MAGIC NEW ORDER BY
```

You can also write raw sql completely. This is not advised, obviously, because it defeats the whole purpose of this library.

```ts
const result = await db.sql`SELECT * FROM account WHERE account.name = ${name}`;
```

Because type information is lost when using raw queries, you can pass in a type

```ts
const result = await db.sql<{ name: string }>`SELECT name FROM list`;

result.rows.forEach(row => {
  // row.name
});
```

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
| enum()                     | _Creates an enum type_      |
| integer()                  | INTEGER                     |
| interval()                 | INTERVAL                    |
| jsonb<T>()                 | JSONB                       |
| json<T>()                  | JSON                        |
| money()                    | MONEY                       |
| number()                   | IntegerColumn               |
| serial()                   | SERIAL                      |
| string()                   | TextColumn                  |
| text()                     | TEXT                        |
| text<T>()                  | TEXT                        |
| time()                     | TIME                        |
| timestamp()                | TIMESTAMP                   |
| timestampWithoutTimeZone() | TIMESTAMP WITHOUT TIME ZONE |
| timestampWithTimeZone()    | TIMESTAMP WITH TIME ZONE    |
| timeWithoutTimeZone()      | TIME WITHOUT TIME ZONE      |
| timeWithTimeZone()         | TIME WITH TIME ZONE         |
| uuid()                     | UUID                        |

### Enum alternative

Instead of using an `EnumColumn`, [because you cannot remove values (only add or rename)](https://www.postgresql.org/docs/current/sql-altertype.html), you can also opt to use a
`text<T>()` which allows enforcing a type in your application e.g.
`text<'ONE' | 'TWO' | 'THREE'>()`.

```ts
export const item = mammoth.defineTable({
  id: mammoth.uuid()
    .primaryKey()
    .notNull()
    .default(`gen_random_uuid()`),
  value: mammoth.text<'FOO' | 'BAR' | 'BAZ'>().notNull(),
});
```

Which enforces type checking of the value column in TypeScript land.

```ts
// Allowed
await db.insertInto(db.item).values({ value: `FOO` });

// Not allowed
await db.insertInto(db.item).values({ value: `another string value` });
```

Of course it doesn't create any constraints on the database level like `enum()` is doing. If that's something you desire you should pick enum instead.

### Documents & JSON(B)

You can use `jsonb<T>()` to store json data. By using the `T` parameter you can specify the
type e.g. `jsonb<{ foo: number }>()`. This makes it easier to work with json columns.

> There is currently limited support for the different json(b) functions and operators. This is planned for a next release.

You do need to be careful when your type needs to evolve (change).

## Contribute / Set up locally

To contribute to this library, you first need to do a few things to get set up.

First make sure you have a test postgres database. For example, `mammoth_test`:

    $ createdb mammoth_test

If you installed postgres using homebrew, make sure you have a postgres user named `postgres`. You can create one using this command: `createuser -s postgres`

Finally, make sure all the tests run and pass before making any changes. Create a `.env` file with the following contents.

```
DATABASE_URL=postgres://postgres@localhost/mammoth_test
```

> Replace the database url connection string with a string to your local database

    $ yarn test

---

##### Mammoth logo created by Eucalyp from the Noun Project.
