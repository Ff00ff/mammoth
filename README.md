# Db

```
yarn add @ff00ff/db
```

A (mostly) type-safe Postgres query builder for TypeScript. **This is not for the front-end, but for the back-end.**

![Select autocomplete](https://user-images.githubusercontent.com/178230/34638202-1f7cca3c-f2c7-11e7-9207-55b6e0b8fe78.gif)

### Quick start
```ts
const rows = await db.list
  .select('id', 'name', 'createdAt', 'value')
  .from(db.list)
  .where(db.list.createdAt.gt(db.now().minus(`2 days`)).or(db.list.value.eq(0)))
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

**Db is under active development. Some things work, but some things are a bit weird and will improve in the coming months.**

### Create

To create a table.

```ts
class List {
  id = new UuidColumn().primary().notNull().default(new UuidGenerateV4());
  createdAt = new TimestampWithTimeZoneColumn().notNull().default(new Now());
  name = new TextColumn().notNull();
  value = new IntegerColumn();
}

class ListItem {
  id = new UuidColumn().primary().notNull().default(new UuidGenerateV4());
  createdAt = new TimestampWithTimeZoneColumn().notNull().default(new Now());
  listId = new UuidColumn().notNull().references<Database>(db => db.list.id);
  name = new TextColumn().notNull();
}
```

### Update

To update rows.

```ts
const numberOfUpdates = await db.list
  .update({
    name: `New Name`
  })
  .where(db.list.id.eq(`acb82ff3-3311-430e-9d1d-8ff600abee31`));
```

### Insert

To insert a row.

![Insert autocomplete](https://user-images.githubusercontent.com/178230/34638201-1f66ed98-f2c7-11e7-8d93-c5792226b044.gif)

```ts
const numberOfRows = await db.list
  .insert({
    id: undefined,
    createdAt: undefined,
    name: `My List`,
  });
```
_You do need to explicitly set all values. The return type is automatically handled._

```ts
const rows = await db.list
  .insert({
    id: undefined,
    createdAt: undefined,
    name: `My List`,
  })
  .returning(`id`, `createdAt`, `name`);
```
_When using `returning()` the return value is automatically changed from an integer (number of affected rows) to an array of objects with keys matching the columns specified._

### Transactions

You can call `db.transaction(callback)` which begins a transaction and depending on the promise you return in the transaction will commit or rollback the transaction.

Best practice is to shadow your database variable, generally `db`, so you do not mistakenly execute queries outside the transaction.

```ts
db.transaction(db => {
  const listId = await db.list
    .insert({
      id: undefined,
      createdAt: undefined,
      name: `My List`,
    })
    .returning(`id`)
    .first();

  await db.listItem
    .insert({
      id: undefined,
      createdAt: undefined,
      listId,
      name: `My Item`,
    });
});
```
__Even though transactions are designed, it's implementation is still a work-in-progress.__

### Migrations

The idea is to automatically generate migrations based on the changes in your tables. A rough first version of the CLI is working, but it's picky about you project structure:

- It expects your db instance to be at `src/db.ts`.
- It writes your migrations to `migrations/`.

For example, in `src/db.ts`:

```ts
import { createDatabase, UuidColumn, TextColumn, IntegerColumn } from '@ff00ff/db';

class Test {
  id = new UuidColumn().primaryKey().notNull().default(new UuidGenerateV4());
  name = new TextColumn().notNull();
  value = new IntegerColumn();
}

export const db = createDatabase({
  test: new Test(),
});

export type Database = typeof db;
```
_It's a best practice to place your tables in `src/tables` instead of directly in `src/db.ts`._

`db migrations generate` should read your tables, read your migrations and generate a new migration based on the changes between them.

### Up next

- Get feedback on the public API.
- Refactor internal API as some bits are a bit in a proof on concept state.
- Extend SQL keywords e.g. UNION, WITH, INSERT INTO-SELECT, etc.
- Improve upsert, delete.
- Support indices and enums.

### Stay in touch!

Please star or watch this repo. Because Db is still in development you can sign up to receive the announcement once we hit 1.0 http://eepurl.com/dgySSz (this is a Mailchimp sign up form). You can also start a discussion on e.g. GitHub to give feedback on the public API.

### Versioning

A final note on the versioning: we're at version 0.X until we consider Db not production-ready. Once we consider the project production-ready we bump to 1.0 and stricly abide to semver.