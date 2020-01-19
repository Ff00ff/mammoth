import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { Database } from '../../../../mammoth/src/database';
import createSql from '../../../../mammoth/modules/mammoth/src/sql-creator';
import { generateSql } from '../../../../mammoth/modules/mammoth/src/sql-generator/table';
import Simulator from '../../../../mammoth/modules/mammoth/src/sql-simulator';
import { TableType, Table } from '../../../../mammoth/src/table';

const writeFileSync = (path: string, data: string) => {
  fs.writeFileSync(path, data);
};

const mkdirSync = (path: string, shouldSucceedIfAlreadyExists: boolean = false) => {
  try {
    fs.mkdirSync(path);
  } catch (e) {
    if (!shouldSucceedIfAlreadyExists || e.code !== 'EEXIST') {
      throw e;
    }
  }
};

interface Transaction {
  sql(strings: TemplateStringsArray, ...parameters: any[]): void;
}

interface Migration {
  up(transaction: Transaction): Promise<any> | void;
  down(transaction: Transaction): Promise<any> | void;
}

const getMigrationTimestamp = (migrationName: string) =>
  parseInt(migrationName.split(`-`)[0].replace(/\./g, ''), 10);

const createFromSimulator = async (migrationsDir: string) => {
  const from = new Simulator();
  const transaction: Transaction = {
    sql(strings: TemplateStringsArray, ..._parameters: any[]) {
      if (strings.length > 1) {
        throw new Error(`Parameters in migration transactions are not supported yet.`);
      }

      from.simulateQuery(strings[0]);
      return Promise.resolve();
    },
  };

  const migrations = fs
    .readdirSync(migrationsDir)
    .filter(fileName => fileName !== '.DS_Store')
    .sort((a, b) => getMigrationTimestamp(a) - getMigrationTimestamp(b))
    .map(migration => path.join(process.cwd(), migrationsDir, migration))
    .map(path => require(path) as Migration);

  let result = Promise.resolve(true);
  migrations.forEach(migration => {
    result = result.then(() => migration.up(transaction));
  });

  await result;

  return from;
};

const createToSimulator = (db: Database<any>) => {
  const to = new Simulator();

  const tableNames = db.getTableNames();

  // TODO: sort these table names so all references are resolved before the actual tables.
  tableNames.forEach(tableName => {
    const table = (db as any)[tableName] as Table<any, any> & TableType;
    const queries = generateSql(table);

    queries.forEach(query => {
      to.simulateQuery(query);
    });
  });

  return to;
};

const generateZeros = (count: number) => new Array(count).fill('0').join('');

const leftpad = (number: number, size: number) =>
  generateZeros(String(size).length - String(number).length) + number;

const getTimestamp = () => {
  const now = new Date();
  return [
    leftpad(now.getFullYear(), 1000),
    leftpad(now.getMonth() + 1, 10),
    leftpad(now.getDate(), 10),
    leftpad(now.getHours(), 10),
    leftpad(now.getMinutes(), 10),
  ].join('.');
};

const addTabs = (string: string) => {
  const tab = '  ';

  return string
    .split(`\n`)
    .map(string => tab + string)
    .join(`\n`);
};

export const generate = async (db: Database<any>, migrationsDir: string) => {
  mkdirSync(migrationsDir, true);

  const from = await createFromSimulator(migrationsDir);
  const to = createToSimulator(db);

  // The createSql step actually mutates the simulators as it compares changes, generates queries,
  // simulates the queries and continues until there are no more changes. Because we need to do this
  // twice, one for the up and one for the down migration, we deep copy the simulators so we can use
  // it later on.
  const fromCopy = new Simulator(from);
  const toCopy = new Simulator(to);

  const up = createSql(from, to, true);

  if (up.queries.length > 0) {
    // NB: we're generating queries to -> from (instead of from -> to) to generate the down queries.
    const down = createSql(toCopy, fromCopy);

    // TODO: what if down.queries is empty? Should this be an error?

    const timestamp = getTimestamp();
    const name = `${timestamp}-${up.names.join('-').slice(0, 50)}.ts`;

    const contents = `import { Transaction } from '@ff00ff/mammoth';

export const up = async (db: Transaction) => {
${up.queries.map(query => addTabs(`await db.sql \`${query}\`;`)).join(`\n\n`)}
}

export const down = async (db: Transaction) => {
${down.queries.map(query => addTabs(`await db.sql \`${query}\`;`)).join(`\n\n`)}
}`;

    writeFileSync(path.join(migrationsDir, name), contents);

    console.log(chalk.green(`Successfully generated migration `) + chalk.green.bold(`${name}.`));
  } else {
    console.log(chalk.green(`Everything up to date.`));
  }
};
