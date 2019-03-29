import { Database } from "../../database";
import { createMigrationTable, getLatestAppliedMigration, getAllAppliedMigrations } from "./migration";

export const rollback = async (db: Database<any>, migrationsDir: string) => {
  await createMigrationTable(db);

  const latestMigration = await getLatestAppliedMigration(db, migrationsDir);

  if (latestMigration) {
    await db.transaction(async transaction => {
      await Promise.resolve(latestMigration.down(transaction));

      await transaction.sql `DELETE FROM db.migration WHERE name = ${latestMigration.name}`;
    });
  }
  else {
    //
  }
};

export const rollbackAll = async (db: Database<any>, migrationsDir: string) => {
  await createMigrationTable(db);

  const appliedMigrations = await getAllAppliedMigrations(db, migrationsDir);

  await db.transaction(async transaction => {
    let result = Promise.resolve(true);

    appliedMigrations.forEach(appliedMigration => {
      result = result.then(() => Promise.resolve(appliedMigration.down(transaction)));
    });

    await transaction.sql `DELETE FROM db.migration`;

    await result;
  });
};