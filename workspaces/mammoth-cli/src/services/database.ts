import { Client } from 'pg';

export interface AppliedMigration {
  version: number;
  checksum: string;
}

export type MakeDatabase = typeof makeDatabase;

export const makeDatabase = async (connectionString: string) => {
  const client = new Client(connectionString);
  await client.connect();

  return {
    async close() {
      await client.end();
    },

    async ensureMigrationTable() {
      await client.query(`CREATE TABLE IF NOT EXISTS migration (
        version integer NOT NULL PRIMARY KEY,
        apply_date timestamptz DEFAULT NOW(),
        checksum text NOT NULL
      )`);
    },

    async findAppliedMigrations() {
      const { rows: appliedMigrations } = await client.query<AppliedMigration>(
        `SELECT version, checksum FROM migration ORDER BY version ASC`,
      );
      return appliedMigrations;
    },

    async applyMigration(sql: string, version: number, checksum: string) {
      try {
        await client.query(`BEGIN`);

        await client.query(sql);

        await client.query(`INSERT INTO migration (version, checksum) VALUES ($1, $2)`, [
          version,
          checksum,
        ]);

        await client.query(`COMMIT`);

        return {
          success: true,
        };
      } catch (e) {
        await client.query(`ROLLBACK`);

        return {
          success: false,
          e,
        };
      }
    },
  };
};
