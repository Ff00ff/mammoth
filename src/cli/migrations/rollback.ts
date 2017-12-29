import { Database } from "../../database";
import { createMigrationTable, getLatestAppliedMigration } from "./migration";

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