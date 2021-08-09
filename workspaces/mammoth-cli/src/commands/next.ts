import * as fs from 'fs-extra';
import * as parser from '@pgql/parse';
import * as path from 'path';

import { Command, flags } from '@oclif/command';

import { DataDefinitionLanguageSimulator } from '../services/data-definition-language-simulator';
import { Db } from '../services/db';
import { createSql } from '../services/create-sql';
import { generateSql } from '../services/generate-sql';
import { makeFancyOutput } from '../services/fancy-output';

export default class NextCommand extends Command {
  static description =
    'generate your next migration based on changes to your defined tables and your existing migrations';

  static examples = [`$ mammoth next --db-file ./src/db.ts`];

  static flags = {
    dbFile: flags.string({
      description: `path to your file exporting your db`,
      default: `./src/db.ts`,
    }),
    dbExport: flags.string({ description: `the name of the db export`, default: `db` }),
    migrationsDir: flags.string({
      description: `directory to your migrations`,
      default: `migrations`,
    }),
  };

  async run() {
    const { flags } = this.parse(NextCommand);

    const fancyOutput = makeFancyOutput(
      `Reading migrations`,
      `Analyzing tables`,
      `Tuning the magic`,
    );

    const migrationsDir = path.join(process.cwd(), flags.migrationsDir);

    await fs.ensureDir(migrationsDir);

    const allFiles = await fs.readdir(migrationsDir);
    const migrationFiles = allFiles
      .filter((file) => !file.startsWith('.'))
      .sort((a, b) => parseInt(a.split('.')[0]) - parseInt(b.split('.')[0]));

    const fromSimulator = new DataDefinitionLanguageSimulator();
    const toSimulator = new DataDefinitionLanguageSimulator();

    fancyOutput.update(`Reading ${migrationFiles.length} migrations`);

    for (const migrationFile of migrationFiles) {
      const sql = await fs.readFile(path.join(migrationsDir, migrationFile), `utf8`);

      fancyOutput.annotate(migrationFile, ``);

      fromSimulator.parse(sql);
    }

    fancyOutput.succeed(`Read ${migrationFiles.length}`, `Analyzing`);

    const dbExports = require(path.join(process.cwd(), flags.dbFile));
    const db = dbExports[flags.dbExport] as undefined | Db;

    if (!db) {
      throw new Error(`Could not find '${flags.dbExport}' export in '${flags.dbFile}'.`);
    }

    fancyOutput.update(`Analyzing ${db.getTableDefinitions().length} tables`);

    const result = generateSql(db);
    for (const ret of result) {
      fancyOutput.annotate(ret.name, ``);

      toSimulator.parse(ret.sql);
    }

    fancyOutput.succeed(`Analyzed tables`, `Doing the magic`);

    const queries = createSql(fromSimulator, toSimulator);

    if (queries.length === 0) {
      fancyOutput.succeed(`No changes`);
      return;
    }

    const lastMigrationFile = migrationFiles[migrationFiles.length - 1] as string | undefined;
    const nextMigrationVersion = `${
      lastMigrationFile ? parseInt(lastMigrationFile.split('.')[0]) + 1 : 1
    }`.padStart(3, `0`);

    fs.writeFileSync(
      path.join(migrationsDir, `${nextMigrationVersion}.sql`),
      queries.join(`\n\n`).trim(),
    );

    fancyOutput.succeed(
      `There, ${nextMigrationVersion}.sql for you with ${queries.length} queries.`,
    );
    fancyOutput.clear();
  }
}
