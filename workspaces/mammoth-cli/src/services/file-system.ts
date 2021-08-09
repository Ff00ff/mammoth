import * as fs from 'fs-extra';
import * as path from 'path';

export interface LocalMigration {
  version: number;
  fileName: string;
  contents(): Promise<string>;
}

export type MakeFileSystem = typeof makeFileSystem;

export const makeFileSystem = (migrationsDir: string) => {
  //

  return {
    async ensureMigrationsDir() {
      await fs.ensureDir(migrationsDir);
    },

    async findLocalMigrations() {
      const allMigrationFiles = await fs.readdir(migrationsDir);
      return allMigrationFiles
        .filter((file) => !file.startsWith('.'))
        .map(
          (migrationFile) =>
            ({
              version: parseInt(migrationFile.split('.')[0]),
              fileName: migrationFile,
            } as LocalMigration),
        )
        .sort((a, b) => a.version - b.version)
        .map((migration) => ({
          ...migration,
          contents() {
            return fs.readFile(path.join(migrationsDir, migration.fileName), `utf8`);
          },
        }));
    },
  };
};
