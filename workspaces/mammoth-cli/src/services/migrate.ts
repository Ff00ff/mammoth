import { AppliedMigration, MakeDatabase } from './database';
import { MakeFancyOutput } from './fancy-output';
import { LocalMigration, MakeFileSystem } from './file-system';
import { parse } from 'pg-connection-string';
import * as crypto from 'crypto';
import * as figures from 'figures';
import { createCodeSnippetFromError } from 'pg-error-snippet';

interface Deps {
  makeFileSystem: MakeFileSystem;
  makeDatabase: MakeDatabase;
  makeFancyOutput: MakeFancyOutput;
}

interface MigrateFn {
  (deps: Deps): (migrationsDir: string, connectionString: string) => Promise<void>;
}

const checksum = async (string: string) => {
  const hash = crypto.createHash(`md5`);
  hash.update(string);
  return hash.digest(`hex`);
};

const findUnappliedMigrations = async (
  localMigrations: LocalMigration[],
  appliedMigrations: AppliedMigration[],
) => {
  let i = 0;

  while (true) {
    const localMigration = localMigrations[i];
    const appliedMigration = appliedMigrations[i];
    const version = i + 1;

    if (!localMigration && !appliedMigration) {
      // Everything is ready. No changes.
      break;
    }

    if (appliedMigration && appliedMigration.version !== version) {
      // So we probably skipped a number in the applied migrations. This is unusual.
      throw new Error(
        `Expected version '${version}' but found version '${appliedMigration.version}'`,
      );
    }

    if (localMigration && localMigration.version !== version) {
      // We skipped a number locally.
      throw new Error(
        `Expected version '${version}' but found local version '${localMigration.version}'`,
      );
    }

    if (!localMigration && appliedMigration) {
      // We have an applied migration, but not locally. Missing local migratio! Yikes!
      throw new Error(`Missing local migration version '${appliedMigration.version}'`);
    }

    const contents = await localMigration.contents();
    const localMigrationChecksum = await checksum(contents);
    if (
      localMigration &&
      appliedMigration &&
      localMigrationChecksum !== appliedMigration.checksum
    ) {
      // The checksum of an applied migration changed. O no!
      throw new Error(
        `Expected checksum '${appliedMigration.checksum}' but found '${localMigrationChecksum}' in migration version '${appliedMigration.version}'`,
      );
    }

    if (!appliedMigration && localMigration) {
      // Finally, this is something we should handle.
      const unappliedMigrations = localMigrations.slice(i);

      unappliedMigrations.forEach((unappliedMigration, index) => {
        if (unappliedMigration.version !== version + index) {
          throw new Error(
            `Expected version '${version + index}' but found migration version '${
              unappliedMigration.version
            }'`,
          );
        }
      });

      return unappliedMigrations;
    }

    // The applied migration and the local migration are the same. Let's go to the next one!
    i++;
  }

  return [];
};

export const makeMigrate: MigrateFn = ({ makeFileSystem, makeDatabase, makeFancyOutput }) => async (
  migrationsDir,
  connectionString,
) => {
  const { database: databaseName } = parse(connectionString);

  const fileSystem = makeFileSystem(migrationsDir);
  const fancyOutput = makeFancyOutput(`Connecting to ${databaseName}`, `Loading`, `Migrating`);
  const database = await makeDatabase(connectionString);

  await fileSystem.ensureMigrationsDir();

  try {
    fancyOutput.succeed(`Connected to ${databaseName}`, `Loading migrations`);

    await database.ensureMigrationTable();

    const appliedMigrations = await database.findAppliedMigrations();

    fancyOutput.update(`Finding unapplied migrations`);

    const localMigrations = await fileSystem.findLocalMigrations();

    const unappliedMigrations = await findUnappliedMigrations(localMigrations, appliedMigrations);

    if (unappliedMigrations.length === 0) {
      fancyOutput.succeed(
        `Loaded ${localMigrations.length} migrations`,
        `Already up-to-date`,
        `succeeded`,
      );
      return;
    } else {
      if (appliedMigrations.length > 0) {
        fancyOutput.succeed(
          `Loaded ${localMigrations.length} migrations`,
          `Migrating from ${appliedMigrations[appliedMigrations.length - 1].version} to ${
            unappliedMigrations[unappliedMigrations.length - 1].version
          }`,
        );
      } else {
        fancyOutput.succeed(
          `Loaded ${localMigrations.length} migrations`,
          `Migrating to ${unappliedMigrations[unappliedMigrations.length - 1].version}`,
        );
      }
    }

    for (const unappliedMigration of unappliedMigrations) {
      const fileName = `${unappliedMigration.version}`.padStart(3, `0`) + '.sql';

      fancyOutput.annotate(figures.arrowRight, fileName);

      const sql = await unappliedMigration.contents();

      const unappliedMigrationChecksum = await checksum(sql);
      const result = await database.applyMigration(
        sql,
        unappliedMigration.version,
        unappliedMigrationChecksum,
      );

      if (result.e) {
        fancyOutput.error(`${fileName}: ${result.e.message}`);

        const snippet: string = createCodeSnippetFromError(result.e, sql, {
          linesBefore: 4,
          linesAfter: 4,
          showColors: true,
          errorStyle: `highlight`,
        });
        console.log(
          '\n' +
            snippet
              .split('\n')
              .map((line) => `  ${line}`)
              .join('\n'),
        );
        process.exitCode = 1;
        return;
      }
    }

    if (appliedMigrations.length > 0) {
      fancyOutput.succeed(
        `Migrated from version ${
          appliedMigrations[appliedMigrations.length - 1].version
        } to version ${unappliedMigrations[unappliedMigrations.length - 1].version}`,
      );
    } else {
      fancyOutput.succeed(
        `Migrated to version ${unappliedMigrations[unappliedMigrations.length - 1].version}`,
      );
    }
  } catch (e) {
    fancyOutput.error(`${e.message}`);
  } finally {
    fancyOutput.clear();

    await database.close();
  }
};
