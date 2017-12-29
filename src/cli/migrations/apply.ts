import { Database } from "../../database";
import { createMigrationTable, getAppliedMigrations, getMigrations } from "./migration";

export const apply = async (db: Database, migrationsDir: string) => {
  await createMigrationTable(db);

  const appliedMigrations = await getAppliedMigrations(db);
  const migrations = getMigrations(migrationsDir);
  const unappliedMigrations = migrations.filter(migration => !appliedMigrations.has(migration.name))

  let result = Promise.resolve();

  unappliedMigrations.forEach(migration => {
    result = result.then(() => db.transaction(async transaction => {
      await Promise.resolve(migration.up(transaction));

      await transaction.sql `INSERT INTO db.migration (name) VALUES (${migration.name})`;
    }));
  });

  try {
    await result;

    // Success!
  }
  catch (e) {
    console.log(e);

    throw e;
  }
};