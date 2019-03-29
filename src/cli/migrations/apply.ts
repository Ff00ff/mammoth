import { Database } from "../../database";
import { createMigrationTable, getAppliedMigrations, getMigrations } from "./migration";
import chalk from 'chalk';

export const apply = async (db: Database<any>, migrationsDir: string) => {
  await createMigrationTable(db);

  const appliedMigrations = await getAppliedMigrations(db);

  const migrations = getMigrations(migrationsDir);
  const unappliedMigrations = migrations.filter(migration => !appliedMigrations.has(migration.name))

  if (unappliedMigrations.length === 0) {
    console.log(chalk.green(`All migrations already applied.`));
    return;
  }

  let result = Promise.resolve();

  unappliedMigrations.forEach(migration => {
    result = result.then(() => db.transaction(async transaction => {
      await Promise.resolve(migration.up(transaction));

      await transaction.sql `INSERT INTO db.migration (name) VALUES (${migration.name})`;
    }));
  });

  try {
    await result;

    if (process.env.NODE_ENV !== `test`) {
      console.log(chalk.green(`Successfully applied ${unappliedMigrations.length} migrations.`));
    }
  } catch (e) {
    console.log(e);

    throw e;
  }
};