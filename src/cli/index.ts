import chalk from 'chalk';
import * as minimist from 'minimist';
import * as path from 'path';
import { Database } from '../database';
import { apply, generate, rollback } from './migrations';

// tslint:disable-next-line:prefer-array-literal
const addSpaces = (count: number) => new Array(count + 1).join(' ');

const loadDatabase = (databasePath: string): Database<any> | undefined => {
  require(`ts-node`).register();

  const object = require(databasePath);

  return object.default || object.db;
}

interface Argv {
  databasePath: string;
  migrationsDir: string;
}

const argv = minimist<Partial<Argv>>(process.argv.slice(2));
const main = async () => {
  const [
    topic,
    action,
  ] = argv._;

  const {
    databasePath = path.join(process.cwd(), `src`, `db.ts`),
    migrationsDir = path.join(process.cwd(), `migrations`),
  } = argv;

  let db: Database<any> | undefined;

  try {
    db = loadDatabase(databasePath);

    if (!db) {
      throw new Error(`Could not find db at ${databasePath}.`);
    }

    if (topic === 'migrations') {
      if (action === `generate`) {
        await generate(db, migrationsDir);
      }
      else if (action === `apply`) {
        await apply(db, migrationsDir);
      }
      else if (action === `rollback`) {
        await rollback(db, migrationsDir);
      }
      else {
        // TODO: show help re. topic migrations.
        console.log(`Unknown migrations action`);
      }
    }
    else {
      // TODO: show help.
      console.log(`Unknown topic and action`);
    }
  }
  catch (e) {
    console.log(`error`);
    console.log(e);

    if (e.query && (e.code === '42601' || e.sqlState === '42601')) {
      console.log('');
      console.log('Error: ' + e.message);
      console.log('');

      const lines = e.query.split('\n');
      const errorPosition = parseInt(e.position, 10);

      let pos = 0;

      for(let i = 0, il = lines.length; i < il; i++) {
        const numberOfTabs = (lines[i].match(/\t/g) || []).length;
        const lineLength = lines[i].length + 1;

        const line = lines[i].replace(/\t/g, '    ');

        console.log(chalk.bgRed(line));

        if(errorPosition > pos && errorPosition < pos + lineLength) {
          const left = (errorPosition - pos);

          console.log(addSpaces(left + numberOfTabs * 3 - 1) + '^');
        }

        pos += lineLength;
      }
    }
    else {
      console.log(e);

      if (e.query) {
        console.log(e.query);
      }
    }
  }
  finally {
    if (db) {
      await db.destroy();
    }
  }
};

main()
  .then(() => {
    //
  })
  .catch(error => {
    console.log(error);
  });