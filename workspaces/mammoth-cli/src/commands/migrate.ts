import * as path from 'path';

import { makeDatabase } from '../services/database';
import { Command, flags } from '@oclif/command';
import { makeFileSystem } from '../services/file-system';

import { makeFancyOutput } from '../services/fancy-output';
import { makeMigrate } from '../services/migrate';

export default class MigrateCommand extends Command {
  static description = 'applies the latest migrations to your database';

  static examples = [`$ mammoth migrate postgres://localhost:5432/test`];

  static flags = {
    migrationsDir: flags.string({
      description: `directory to your migrations`,
      default: `migrations`,
    }),
  };

  static args = [
    {
      name: `connectionString`,
      required: true,
      description: `the connection string to your postgres database`,
    },
  ];

  async run() {
    const { flags, args } = this.parse(MigrateCommand);
    const migrationsDir = path.join(process.cwd(), flags.migrationsDir);

    const migrator = makeMigrate({
      makeFileSystem,
      makeFancyOutput,
      makeDatabase,
    });
    await migrator(migrationsDir, args.connectionString);
  }
}
