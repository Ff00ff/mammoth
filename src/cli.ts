import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import minimist from 'minimist';
import { Database } from './database';
import { createSql } from './sql-creator';
import { generateSql } from './sql-generator';
import { Simulator } from './sql-simulator';
import { Client } from 'pg';

interface Arguments {
  [`database-url`]: string;
  [`migrations-dir`]: string;
  [`db-path`]: string;
}

const writeFileSync = (path: string, data: string) => {
  fs.writeFileSync(path, data);
};

const mkdirSync = (path: string) => {
  try {
    fs.mkdirSync(path);
  } catch (e) {
    if (e.code !== 'EEXIST') {
      throw e;
    }
  }
};

const getLocalMigrationFileNames = (migrationsDir: string) => {
  return fs.readdirSync(migrationsDir).filter(fileName => fileName !== '.DS_Store');
};

const generateZeros = (count: number) => new Array(count).fill('0').join('');

const leftpad = (number: number, size: number) =>
  generateZeros(String(size).length - String(number).length) + number;

const createTimestamp = () => {
  const now = new Date();
  return [
    leftpad(now.getFullYear(), 1000),
    leftpad(now.getMonth() + 1, 10),
    leftpad(now.getDate(), 10),
    leftpad(now.getHours(), 10),
    leftpad(now.getMinutes(), 10),
  ].join('.');
};

const createChecksum = (fullFileName: string) => {
  return new Promise<string>(resolve => {
    const hash = crypto.createHash(`md5`);
    const readStream = fs.createReadStream(fullFileName);

    readStream.on(`data`, data => hash.update(data));
    readStream.on(`end`, () => {
      resolve(hash.digest(`hex`));
    });
  });
};

const getMigrationTimestamp = (migrationName: string) =>
  parseInt(migrationName.split(`-`)[0].replace(/\./g, ''), 10);

const main = async () => {
  const argv = minimist<Partial<Arguments>>(process.argv.slice(2));
  const [command, ...extra] = argv._;

  const {
    [`database-url`]: databaseUrl,
    [`migrations-dir`]: migrationsDir = `./migrations`,
    [`db-path`]: dbPath = './.mammoth.ts',
  } = argv;

  if (command === `new`) {
    mkdirSync(path.join(process.cwd(), migrationsDir));

    const ext = path.extname(dbPath);
    const isTypeScript = ext === `ts`;

    if (isTypeScript) {
      require(`ts-node`).register();
    }

    // Create the from simulator and load all the migrations in it
    const from = new Simulator();

    const migrationFullFileNames = getLocalMigrationFileNames(migrationsDir)
      .sort((a, b) => getMigrationTimestamp(a) - getMigrationTimestamp(b))
      .map(migration => path.join(process.cwd(), migrationsDir, migration));

    for (const fullFileName of migrationFullFileNames) {
      // TODO: this loads the full file in memory. So if we have massive migration files this may
      // cause issues. Large migration files are often because of data, which we should actually
      // offload to some other mechanism so not considering this a high priority right now. At some
      // point it would be nice to be able to stream the query input to the simulator (which simply
      // discards any non-schema query like insert into).
      const sql = fs.readFileSync(fullFileName, `utf8`);

      // TODO: sql actually contains multiple queries. This probably won't work in the simulator so we
      // need some method to split the things.
      from.simulateQuery(sql);
    }

    // Create a to simulator. Generate the sql of every table and run it through simulateQuery.
    const to = new Simulator();

    const database = require(path.join(process.cwd(), dbPath));
    const db = (database.db as any) as Database<any>;
    const tableNames = db.getTableNames();

    tableNames.forEach(tableName => {
      const table = db[tableName];

      const queries = generateSql({
        name: table.getName(),
        columns: table.getColumns().map(columnWrapper => ({
          dataType: columnWrapper.column.dataType,
          enumValues: undefined,
          config: {
            primary: columnWrapper.column.config.primary,
            default: columnWrapper.column.config.default,
            check: columnWrapper.column.config.check,
            notNull: columnWrapper.column.config.notNull,
            unique: columnWrapper.column.config.unique,
            references: columnWrapper.column.config.references
              ? {
                  tableName: columnWrapper.column.config.references.tableName,
                  columnName: columnWrapper.column.config.references.columnName,
                }
              : undefined,
            onDelete: columnWrapper.column.config.onDelete,
            onUpdate: columnWrapper.column.config.onUpdate,
          },
          snakeCaseName: columnWrapper.getSnakeCaseName(),
        })),
      });
      queries.forEach(query => {
        to.simulateQuery(query);
      });
    });

    // Create the queries to change from simulator to to simulator
    const result = createSql(from, to);

    writeFileSync(
      path.join(
        process.cwd(),
        migrationsDir,
        `${createTimestamp()}-${extra.join(`-`).toLowerCase()}.sql`,
      ),
      result.queries.join(`\n\n`).trim(),
    );
  } else if (command === `migrate`) {
    // create mammoth schema and migration table
    const client = new Client({ connectionString: databaseUrl });

    await client.connect();

    await client.query(`CREATE SCHEMA IF NOT EXISTS mammoth`);
    await client.query(`CREATE TABLE IF NOT EXISTS mammoth.migration (
      name TEXT NOT NULL PRIMARY KEY,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      checksum TEXT NOT NULL
    )`);

    interface Migration {
      name: string;
      checksum: string | Promise<string>;
    }

    const result = await client.query(`SELECT name, checksum FROM mammoth.migration`);
    const appliedMigrations = (result.rows as Migration[]).sort(
      (a, b) => getMigrationTimestamp(a.name) - getMigrationTimestamp(b.name),
    );
    const localMigrations = getLocalMigrationFileNames(migrationsDir)
      .map(migrationName => ({
        name: migrationName,
        checksum: createChecksum(path.join(migrationsDir, migrationName)),
      }))
      .reduce((map, localMigration) => {
        map.set(localMigration.name, localMigration);
        return map;
      }, new Map<string, Migration>());
    const unappliedLocalMigrationNames = new Set(localMigrations.keys());

    // Check if all applied migrations still exist and didn't change.
    for (const appliedMigration of appliedMigrations) {
      const localMigration = localMigrations.get(appliedMigration.name);
      if (!localMigration) {
        throw new Error(
          `Could not find migration '${appliedMigration.name}' which was previously applied.`,
        );
      }

      const localChecksum = await localMigration.checksum;
      const checksum = await Promise.resolve(appliedMigration.checksum);

      if (localChecksum !== checksum) {
        throw new Error(
          `Migration '${appliedMigration.name}' is changed after it is applied. Please consider migrations to be immutable.`,
        );
      }

      unappliedLocalMigrationNames.delete(localMigration.name);
    }

    // And finally let's find the local migrations we still need to apply.
    if (unappliedLocalMigrationNames.size > 0) {
      let latestTimestamp: number | undefined;

      if (appliedMigrations.length > 0) {
        const lastAppliedMigration = appliedMigrations[appliedMigrations.length - 1];
        latestTimestamp = getMigrationTimestamp(lastAppliedMigration.name);
      }

      // Check if the timestamps of the unapplied local migrations are unique.
      const timestamps = new Set(
        Array.from(unappliedLocalMigrationNames.values()).map(migrationName =>
          getMigrationTimestamp(migrationName),
        ),
      );
      if (timestamps.size !== unappliedLocalMigrationNames.size) {
        throw new Error(`Migrations cannot have the same timestamp.`);
      }

      const sortedUnappliedMigrations = Array.from(unappliedLocalMigrationNames.values())
        .map(migrationName => localMigrations.get(migrationName))
        .sort((a, b) => getMigrationTimestamp(a!.name) - getMigrationTimestamp(b!.name));

      // It should not be possible to apply a migration with a timestamp earlier than any already
      // applied migration. Because the unapplied migrations are now sorted, we just check if the
      // first migration's timestamp is after the timestamp of the last applied migration.
      if (
        latestTimestamp !== undefined &&
        getMigrationTimestamp(sortedUnappliedMigrations[0]!.name) <= latestTimestamp
      ) {
        throw new Error(
          `Migration '${sortedUnappliedMigrations[0]!.name}' has timestamp '${getMigrationTimestamp(
            sortedUnappliedMigrations[0]!.name,
          )}' after latest applied timestamp of '${latestTimestamp}'.`,
        );
      }

      for (const unappliedMigration of sortedUnappliedMigrations) {
        const sql = fs.readFileSync(path.join(migrationsDir, unappliedMigration!.name), `utf8`);

        try {
          await client.query(`BEGIN`);

          await client.query(sql);

          await client.query(`INSERT INTO mammoth.migration (name, checksum) VALUES ($1, $2)`, [
            unappliedMigration!.name,
            await Promise.resolve(unappliedMigration!.checksum),
          ]);

          await client.query(`COMMIT`);
        } catch (e) {
          // TODO: show the actual error of this query.
          console.log(e);

          await client.query(`ROLLBACK`);
        }
      }
    } else {
      console.log(`No changes`);
    }

    await client.end();
  } else {
    console.log(`Usage: mammoth <command>
  [--database-url <path>]
  [--migrations-dir <path>]
  [--db-path <path>]

Below is a list of all the commands.

  migrate           Executes any migrations which are not yet applied to the target database.
  next <name>       Creates the next migration file with any changes applied to the schema.
`);
  }
};
main();
