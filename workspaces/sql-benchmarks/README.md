# SQL Benchmarks

This adds some simple benchmarks between Mammoth (backed by PG), TypeORM and Knex. It's not really an apple-to-apple comparison, but gives us a rough idea where we stand in terms of performance.

You first have to create the test table.

```sql
CREATE TABLE item (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  value integer
);
```

And from the root of this repo you can run the below command. Make sure to pass the right connection string to the `PG` env var.

```
PG=.. npm run start -w sql-benchmarks
```
