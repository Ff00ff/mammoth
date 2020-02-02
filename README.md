> This is `mammoth@next` which is not available in npm yet. Switch to [mammoth@master](https://github.com/Ff00ff/mammoth/tree/master) to see the current version.

![Mammoth](https://s3-eu-west-1.amazonaws.com/mammoth-static.ff00ff.nl/mammoth-logo.png)

# Mammoth: A type-safe Postgres query builder for TypeScript.

[![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fff00ff%2Fmammoth%2Fbadge%3Fref%3Dnext&style=flat)](https://actions-badge.atrox.dev/ff00ff/mammoth/goto?ref=next)
[![MIT License](https://img.shields.io/github/license/ff00ff/mammoth.svg)](https://raw.githubusercontent.com/Ff00ff/mammoth/master/LICENSE)

```
yarn add @ff00ff/mammoth
```

<br/>

Mammoth is a type-safe query builder. It only supports Postgres which we consider a feature. It's syntax is as close to SQL as possible so you already know how to use it. It's autocomplete features are great. It helps you avoid mistakes so you can develop applications faster. It comes with all features you need to create production ready apps.

---

## Features

- Type-safe query builder
- Supports Postgres only
- Excellent autocomplete
- Transactions
- Automatic migration generation based on changes to your schema
- Connection pooling
- Automatic camelCase to snake_case conversion
- CLI

---

<br/>

### Quick start

```ts
const rows = await select(list.id, list.createdAt)
  .from(list)
  .where(list.createdAt.gt(now().minus(`2 days`)).or(list.value.eq(0)))
  .limit(10);
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

To update rows. By default the return type is `number` which indicates the number of affected rows.

```ts
const numberOfUpdates = await update(list)
  .set({
    name: `New Name`,
  })
  .where(list.id.eq(`acb82ff3-3311-430e-9d1d-8ff600abee31`));
```

But when you use `.returning(..)` the return type is changed to an array of rows.

```ts
// { id: string }[]
const rows = await update(list)
  .set({
    name: `New Name`,
  })
  .where(list.id.eq(`acb82ff3-3311-430e-9d1d-8ff600abee31`))
  .returning(`id`);
```

### Insert

To insert a row you only have to specify the `.notNull()` without a `.default()`. The other columns are optional.

```ts
const numberOfRows = await insertInto(list).values({
  name: `My List`,
});
```

> In an earlier version of Mammoth you still had to pass `undefined` for nullable columns, but with some type magic this is now fixed!

Again, if you use `.returning(..)` the return type is changed automatically.

```ts
// { id: string, createdAt: Date, name: string }
const list = await insertInto(list)
  .values({
    createdAt: null,
    name: `My List`,
  })
  .returning(`id`, `createdAt`, `name`);
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

### Transactions

You can call `transaction(callback)` which begins a transaction and depending on the promise you return in the transaction will commit or rollback the transaction.

```ts
const result = await transaction(({ insertInto }) => {
  const row = await insertInto(list)
    .values({
      name: `My List`,
    })
    .returning(`id`);

  await insertInto(listItem).values({
    listId: row.id,
    name: `My Item`,
  });

  return row;
});
```

### Schema

Before Mammoth can offer type safety features you have to define the schema in Mammoth's syntax. The syntax is designed to be as close to SQL as possible. You create a class per table like the below.

```ts
class List {
  id = new Column<string>(`UUID`)
    .primary()
    .notNull()
    .default(`gen_random_uuid()`);
  createdAt = new Column<Date>(`TIMESTAMP WITH TIME ZONE`).notNull().default(`NOW()`);
  name = new Column<string>(`TEXT`).notNull();
  value = new Column<number>(`INTEGER`);
}
```

But to make things easier, there are data type specific columns. When using auto import this should be a breeze.

```ts
class List {
  id = new UuidColumn()
    .primary()
    .notNull()
    .default(`gen_random_uuid()`);
  createdAt = new TimestampWithTimeZoneColumn().notNull().default(`NOW()`);
  name = new TextColumn().notNull();
  value = new IntegerColumn();
}

class ListItem {
  id = new UuidColumn()
    .primary()
    .notNull()
    .default(new GenRandomUuid());
  createdAt = new TimestampWithTimeZoneColumn().notNull().default(new Now());
  listId = new UuidColumn().notNull().references(() => db.list.id);
  name = new TextColumn().notNull();
}
```

### Migrations

The accompanying `mammoth-cli` helps you generate migrations based on your schema and existing migrations.

### Raw queries

When a new keyword is introduced in Postgres which you want to use badly but is not supported in this library yet, you can always fall back to raw sql. You can mix the type-safe functions with raw sql:

```ts
select(account.id).from(account).append`MAGIC NEW ORDER BY`;
```

```sql
SELECT account.id FROM account MAGIC NEW ORDER BY
```

You can also write raw sql completely. This is not advised, obviously, because it defeats the whole purpose of this library.

```ts
const result = await sql`SELECT * FROM account WHERE account.name = ${name}`;
```

### Column data type

| Class                          | SQL data type               |
| ------------------------------ | --------------------------- |
| BinaryColumn                   | BYTEA                       |
| BlobColumn                     | BYTEA                       |
| ByteaColumn                    | BYTEA                       |
| CaseInsensitiveTextColumn      | CITEXT                      |
| CitextColumn                   | CITEXT                      |
| DateColumn                     | DATE                        |
| DecimalColumn                  | DECIMAL                     |
| EnumColumn                     | _Creates an enum type_      |
| IntegerColumn                  | INTEGER                     |
| IntervalColumn                 | INTERVAL                    |
| JSONBColumn<T>                 | JSONB                       |
| JSONColumn<T>                  | JSON                        |
| MoneyColumn                    | MONEY                       |
| NumberColumn                   | IntegerColumn               |
| SerialColumn                   | SERIAL                      |
| StringColumn                   | TextColumn                  |
| TextColumn                     | TEXT                        |
| TextColumn<T>                  | TEXT                        |
| TimeColumn                     | TIME                        |
| TimestampColumn                | TIMESTAMP                   |
| TimestampWithoutTimeZoneColumn | TIMESTAMP WITHOUT TIME ZONE |
| TimestampWithTimeZoneColumn    | TIMESTAMP WITH TIME ZONE    |
| TimeWithoutTimeZoneColumn      | TIME WITHOUT TIME ZONE      |
| TimeWithTimeZoneColumn         | TIME WITH TIME ZONE         |
| UuidColumn                     | UUID                        |

### Enum alternative

Instead of using an `EnumColumn`, which is sometimes inflexible, you can also opt to use a
`TextColumn<T>` which allows enforcing a type in your application e.g.
`TextColumn<'ONE' | 'TWO' | 'THREE'>`.

```ts
class MyTable {
  id = new UuidColumn()
    .primaryKey()
    .notNull()
    .default(new GenRandomUuid());
  value = new TextColumn<'FOO' | 'BAR' | 'BAZ'>().notNull();
}
```

Which enforces type checking of the value column in TypeScript land.

```ts
// Allowed
await db.insertInto(db.myTable).values({ value: `FOO` });

// Not allowed
await db.insertInto(db.myTable).values({ value: `another string value` });
```

Of course it doesn't create any constraints on the database level like `EnumColumn` is doing. If that's something you desire you should pick enum instead.

### Documents & JSON(B)

You can use `JSONBColumn<T>` to store json data. By using the `T` parameter you can specify the
type e.g. `JSONBColumn<{ foo: number }>`. This makes it easy to work with json columns.

```ts
class MyTable {
  id = new UuidColumn()
    .primaryKey()
    .notNull()
    .default(new GenRandomUuid());
  value = new JSONBColumn<{ foo: string }>();
}
```

```ts
```

You do need to be careful when your type needs to evolve (change).

### Versioning

A final note on the versioning: we're at version 0.X until we consider Mammoth production-ready.
This should be fairly soon as Mammoth is used in a couple of projects already. Once we do we bump to
1.0 though we will strictly abide to semver.

## Developing Locally

To contribute to this library, you first need to do a few things to get set up.

First make user you have a test postgres database. For example, `mammoth_test`:

    $ createdb mammoth_test

If you installed postgres using homebrow, make sure you have a postgres user named `postgres`. You can create one using this command: `createuser -s postgres`

Finally, make sure all the tests run and pass before making any changes:

    $ DATABASE_URL=postgres://postgres@localhost/mammoth_test yarn test

---

##### Mammoth logo created by Eucalyp from the Noun Project.
