import * as fs from 'fs';
import * as path from 'path';
import { Database } from '../../../../mammoth/src/database';

export interface Transaction {
  sql(strings: TemplateStringsArray, ...parameters: any[]): void;
}

export interface Migration {
  name: string;
  up(transaction: Transaction): Promise<any> | void;
  down(transaction: Transaction): Promise<any> | void;
}

const getMigrationTimestamp = (migrationName: string) =>
  parseInt(migrationName.split(`-`)[0].replace(/\./g, ''), 10);

export const getMigrations = (migrationsDir: string): Migration[] =>
  fs
    .readdirSync(migrationsDir)
    .filter(fileName => fileName !== '.DS_Store')
    .sort((a, b) => getMigrationTimestamp(a) - getMigrationTimestamp(b))
    .map(migrationName => ({
      ...require(path.join(process.cwd(), migrationsDir, migrationName)),
      name: migrationName,
    }));

export const createMigrationTable = async (db: Database<any>) => {
  try {
    await db.sql`CREATE SCHEMA db CREATE TABLE migration (
      name TEXT NOT NULL PRIMARY KEY,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )`;
  } catch (error) {
    const schemaAlreadyExistsErrorCode = `42P06`;

    if (
      error.code === schemaAlreadyExistsErrorCode ||
      error.sqlState === schemaAlreadyExistsErrorCode
    ) {
      // The schema already exists. That's fine.
      // TODO: what if schema already exists but table not?
    } else {
      throw error;
    }
  }
};

export const getAppliedMigrations = async (db: Database<any>): Promise<Set<string>> => {
  const result = await db.sql`SELECT name FROM db.migration`;

  return new Set(result.rows.map(row => row.name));
};

export const getLatestAppliedMigrationName = async (
  db: Database<any>,
): Promise<string | undefined> => {
  const result = await db.sql`SELECT name FROM db.migration ORDER BY name DESC LIMIT 1`;

  if (result.rows.length > 0) {
    const row = result.rows[0];
    return row.name;
  }

  return undefined;
};

export const getLatestAppliedMigration = async (
  db: Database<any>,
  migrationsDir: string,
): Promise<Migration | undefined> => {
  const migrationName = await getLatestAppliedMigrationName(db);

  if (migrationName) {
    return {
      ...require(path.join(process.cwd(), migrationsDir, migrationName)),
      name: migrationName,
    };
  }

  return undefined;
};

export const getAllAppliedMigrations = async (
  db: Database<any>,
  migrationsDir: string,
): Promise<Migration[]> => {
  const result = await db.sql`SELECT name FROM db.migration`;

  return result.rows
    .map(row => row.name)
    .sort((a, b) => getMigrationTimestamp(b) - getMigrationTimestamp(a))
    .map(migrationName => ({
      ...require(path.join(process.cwd(), migrationsDir, migrationName)),
      name: migrationName,
    }));
};
