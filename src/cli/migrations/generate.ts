import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { Database } from "../../database";
import createSql from "../../sql-creator";
import { generateCreateTableSql } from '../../sql-generator/table';
import Simulator from "../../sql-simulator";
import { Table, TableWrapper } from '../../table';

const writeFileSync = (path: string, data: string) => {
  fs.writeFileSync(path, data);
}

const mkdirSync = (path: string, shouldSucceedIfAlreadyExists: boolean = false) => {
  try {
    fs.mkdirSync(path);
  }
  catch (e) {
    if (!shouldSucceedIfAlreadyExists || e.code !== 'EEXIST') {
      throw e;
    }
  }
}

interface Transaction {
  sql(strings: TemplateStringsArray, ...parameters: any[]): void;
}

interface Migration {
  up(transaction: Transaction): Promise<any> | void;
  down(transaction: Transaction): Promise<any> | void;
}

const getMigrationTimestamp = (migrationName: string) => parseInt(migrationName.split(`-`)[0], 10);

const createFromSimulator = (migrationsDir: string) => {
  const from = new Simulator();
  const transaction: Transaction = {
    sql(strings: TemplateStringsArray, ..._parameters: any[]) {
      if (strings.length > 1) {
        throw new Error(`Parameters in migration transactions are not supported yet.`);
      }

      from.simulateQuery(strings[0]);
      return Promise.resolve();
    }
  }

  fs.readdirSync(migrationsDir)
    .sort((a, b) => getMigrationTimestamp(a) - getMigrationTimestamp(b))
    .map(migration => path.join(migrationsDir, migration))
    .map(path => require(path) as Migration)
    .forEach(migration => migration.up(transaction));

  return from;
}

const createToSimulator = (db: Database) => {
  const to = new Simulator();

  db.tableNames.forEach(tableName => {
    console.log(`createToSimulator(): Create ${tableName}`);

    const table = (db as any)[tableName] as TableWrapper<any, any> & Table;

    console.log(`Table = `);
    console.log(table);

    const query = generateCreateTableSql(table);

    to.simulateQuery(query);
  });

  return to;
}

const getTimestamp = () => {
  const now = new Date();
  return [
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
  ].join('');
}

const addTabs = (string: string) => {
  const tab = '  ';

  return string
    .split(`\n`)
    .map(string => tab + string)
    .join(`\n`);
};

export const generate = async (db: Database<any>, migrationsDir: string) => {
  mkdirSync(migrationsDir, true);

  const from = createFromSimulator(migrationsDir);
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

    const contents = `import { Transaction } from '@ff00ff/db';

export const up = async (transaction: Transaction) => {
${up.queries.map(query => addTabs(`await transaction.sql \`${query}\`;`)).join(`\n\n`)}
}

export const down = async (transaction: Transaction) => {
${down.queries.map(query => addTabs(`await transaction.sql \`${query}\`;`)).join(`\n\n`)}
}`;

    writeFileSync(path.join(migrationsDir, name), contents);

    up.queries.forEach(query => console.log(query));

    console.log(chalk.green(`Successfully generated migration `) + chalk.green.bold(`${name}.`));
  }
  else {
    console.log(chalk.green(`Everything up to date.`));
  }
};