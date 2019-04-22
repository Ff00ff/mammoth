![Mammoth](https://s3-eu-west-1.amazonaws.com/mammoth-static.ff00ff.nl/mammoth-logo.png)

# Mammoth: A (mostly) type-safe Postgres query builder for TypeScript.

[![Build Status](https://travis-ci.org/Ff00ff/mammoth.svg?branch=master)](https://travis-ci.org/Ff00ff/mammoth)
[![Coverage Status](https://coveralls.io/repos/github/Ff00ff/mammoth/badge.svg?branch=master)](https://coveralls.io/github/Ff00ff/mammoth?branch=master)

```
yarn add @ff00ff/mammoth
```

<br/>

---

## Features

- Type-safe query builder.
- Supports Postgres only.
- Excellent autocomplete.
- Transactions.
- Automatic migration generation based on changes to your schema.
- Connection pooling.
- Automatic camelCase to snake_case conversion.
- CLI.

---

<br/>

### Quick start

```ts
const rows = await db
  .select(db.list.id, db.list.createdAt)
  .from(db.list)
  .where(db.list.createdAt.gt(now().minus(`2 days`)).or(db.list.value.eq(0)))
  .limit(10);
```

_A select should not require declaring an additional interface explicitly._

The type of rows is automatically derived from the table. You do not have to specify this. For example, column `value` with type `INTEGER` is not declared `NOT NULL` and thus is `null` or `number`.

```ts
const rows: {
  id: string;
  name: string;
  createdAt: Date;
  value: number | null;
}[];
```

**Mammoth is under active development. Some things work, but some things are a bit weird and will improve in the coming months.**

### Create

To create a table. Using `mammoth migrations generate` you can generate migrations of your tables and `mammoth migrations apply` applies the migrations in your database. When you applied the migrations, change your tables and generate your migrations again, a new migration file with only the changes is created. See [Migrations](#migrations) section for more info.

```ts
class List {
  id = new UuidColumn()
    .primary()
    .notNull()
    .default(new UuidGenerateV4());
  createdAt = new TimestampWithTimeZoneColumn().notNull().default(new Now());
  name = new TextColumn().notNull();
  value = new IntegerColumn();
}

class ListItem {
  id = new UuidColumn()
    .primary()
    .notNull()
    .default(new UuidGenerateV4());
  createdAt = new TimestampWithTimeZoneColumn().notNull().default(new Now());
  listId = new UuidColumn().notNull().references<Database>(db => db.list.id);
  name = new TextColumn().notNull();
}
```

### Update

To update rows.

```ts
const numberOfUpdates = await db
  .update(db.list)
  .set({
    name: `New Name`,
  })
  .where(db.list.id.eq(`acb82ff3-3311-430e-9d1d-8ff600abee31`));
```

### Insert

To insert a row.

```ts
const numberOfRows = await db.insertInto(db.list).values({
  createdAt: null,
  name: `My List`,
});
```

_You do need to explicitly set all values. The return type is automatically handled._

```ts
const list = await db
  .insertInto(db.list)
  .values({
    createdAt: null,
    name: `My List`,
  })
  .returning(`id`, `createdAt`, `name`);
```

_When using `returning()` the return value is automatically changed from an integer (number of affected rows) to an object or array of objects with keys matching the columns specified._

### Transactions

You can call `db.transaction(callback)` which begins a transaction and depending on the promise you return in the transaction will commit or rollback the transaction.

Best practice is to shadow your database variable, generally `db`, so you do not mistakenly execute queries outside the transaction.

```ts
const list = await db.transaction(db => {
  const list = await db
    .insertInto(db.list)
    .values({
      createdAt: null,
      name: `My List`,
    })
    .returning(`id`);

  await db.insertInto(db.listItem).values({
    createdAt: undefined,
    listId: list.id,
    name: `My Item`,
  });

  return list;
});
```

### Migrations

The idea is to automatically generate migrations based on the changes in your tables. A rough first version of the CLI is working, but it's picky about you project structure:

- It expects your db instance to be at `src/db.ts`.
- It writes your migrations to `migrations/`.

For example, in `src/db.ts`:

```ts
import { createDatabase, UuidColumn, TextColumn, IntegerColumn } from '@ff00ff/mammoth';

class Test {
  id = new UuidColumn()
    .primaryKey()
    .notNull()
    .default(new UuidGenerateV4());
  name = new TextColumn().notNull();
  value = new IntegerColumn();
}

// Example value: `postgres://postgres@localhost/test`
const dbName = process.env.DATABASE_URL;

export const db = createDatabase(dbName, {
  test: new Test(),
});

export type Database = typeof db;
```

_It's a best practice to place your tables in `src/tables` instead of directly in `src/db.ts`._

`mammoth migrations generate` should read your tables in `src/tables`, read your migrations and generate a new migration based on the changes between them.

### Raw queries

When a new keyword is introduced in Postgres which you want to use badly but is not supported in this library yet, you can always fall back to raw sql. You can mix the type-safe functions with raw sql:

```ts
db.select(db.account.id).from(db.account).append`MAGIC NEW ORDER BY`;
```

```sql
SELECT account.id FROM account MAGIC NEW ORDER BY
```

You can also write raw sql completely. This is not advised, obviously, because it defeats the whole purpose of this library.

```ts
const result = await db.sql`SELECT * FROM account WHERE account.name = ${name}`;
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
`TextColumn<'ONE' | 'TWO' | 'THREE'>`. Of course it doesn't create any constraints on the database
like `EnumColumn` is doing.

### Documents & JSON(B)

You can use `JSONBColumn<T>` to store json data. By using the `T` parameter you can specify the
type e.g. `JSONBColumn<{ foo: number }>`. This makes it easy to work with json columns. You do need
to be careful when your type needs to evolve (change).

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
