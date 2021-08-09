import { getHeapStatistics } from 'v8';
import { isMainThread } from 'worker_threads';
import { MakeDatabase } from '../database';
import { MakeFancyOutput } from '../fancy-output';
import { MakeFileSystem } from '../file-system';
import { makeMigrate } from '../migrate';

describe(`migrate`, () => {
  const fileSystem = {
    ensureMigrationsDir: jest.fn().mockResolvedValue(undefined),
    findLocalMigrations: jest.fn(),
  };
  const makeFileSystem: MakeFileSystem = () => fileSystem;

  const fancyOutput = {
    update: jest.fn(),
    annotate: jest.fn(),
    succeed: jest.fn(),
    error: jest.fn(),
    clear: jest.fn(),
  };
  const makeFancyOutput: MakeFancyOutput = () => fancyOutput;

  const database = {
    applyMigration: jest.fn(),
    close: jest.fn(),
    ensureMigrationTable: jest.fn(),
    findAppliedMigrations: jest.fn().mockResolvedValue([]),
  };
  const makeDatabase: MakeDatabase = () => Promise.resolve(database);

  afterEach(() => {
    jest.resetAllMocks();
  });

  it(`should err if the new local migration version number wasn't the next version number`, async () => {
    fileSystem.findLocalMigrations.mockResolvedValue([
      {
        version: 2,
        fileName: `002.sql`,
      },
    ]);

    const migrator = makeMigrate({
      makeDatabase,
      makeFancyOutput,
      makeFileSystem,
    });
    await migrator('migrations-dir', `postgres://localhost/database_name`);

    expect(fancyOutput.error).toMatchInlineSnapshot(`
      [MockFunction] {
        "calls": Array [
          Array [
            "Expected version '1' but found local version '2'",
          ],
        ],
        "results": Array [
          Object {
            "type": "return",
            "value": undefined,
          },
        ],
      }
    `);
    expect(database.applyMigration).not.toHaveBeenCalled();
  });

  it(`should err if a applied migrations skipped a version`, async () => {
    fileSystem.findLocalMigrations.mockResolvedValue([
      {
        version: 1,
        fileName: `001.sql`,
        contents: () => Promise.resolve(`test`),
      },
      {
        version: 2,
        fileName: `002.sql`,
        contents: () => Promise.resolve(`test`),
      },
      {
        version: 3,
        fileName: `003.sql`,
        contents: () => Promise.resolve(`test`),
      },
    ]);
    database.findAppliedMigrations.mockResolvedValue([
      {
        version: 1,
        checksum: `098f6bcd4621d373cade4e832627b4f6`,
      },
      {
        version: 3,
        checksum: `098f6bcd4621d373cade4e832627b4f6`,
      },
    ]);

    const migrator = makeMigrate({
      makeDatabase,
      makeFancyOutput,
      makeFileSystem,
    });
    await migrator('migrations-dir', `postgres://localhost/database_name`);

    expect(fancyOutput.error).toMatchInlineSnapshot(`
      [MockFunction] {
        "calls": Array [
          Array [
            "Expected version '2' but found version '3'",
          ],
        ],
        "results": Array [
          Object {
            "type": "return",
            "value": undefined,
          },
        ],
      }
    `);
    expect(database.applyMigration).not.toHaveBeenCalled();
  });

  it(`should err if we cannot find an applied migrations locally`, async () => {
    fileSystem.findLocalMigrations.mockResolvedValue([]);
    database.findAppliedMigrations.mockResolvedValue([
      {
        version: 1,
        checksum: `098f6bcd4621d373cade4e832627b4f6`,
      },
    ]);

    const migrator = makeMigrate({
      makeDatabase,
      makeFancyOutput,
      makeFileSystem,
    });
    await migrator('migrations-dir', `postgres://localhost/database_name`);

    expect(fancyOutput.error).toMatchInlineSnapshot(`
      [MockFunction] {
        "calls": Array [
          Array [
            "Missing local migration version '1'",
          ],
        ],
        "results": Array [
          Object {
            "type": "return",
            "value": undefined,
          },
        ],
      }
    `);
    expect(database.applyMigration).not.toHaveBeenCalled();
  });

  it(`should err if local checksum was different from remote checksum`, async () => {
    fileSystem.findLocalMigrations.mockResolvedValue([
      {
        version: 1,
        fileName: `001.sql`,
        contents: () => Promise.resolve(`test`),
      },
    ]);
    database.findAppliedMigrations.mockResolvedValue([
      {
        version: 1,
        checksum: `a different checksum`,
      },
    ]);

    const migrator = makeMigrate({
      makeDatabase,
      makeFancyOutput,
      makeFileSystem,
    });
    await migrator('migrations-dir', `postgres://localhost/database_name`);

    expect(fancyOutput.error).toMatchInlineSnapshot(`
      [MockFunction] {
        "calls": Array [
          Array [
            "Expected checksum 'a different checksum' but found '098f6bcd4621d373cade4e832627b4f6' in migration version '1'",
          ],
        ],
        "results": Array [
          Object {
            "type": "return",
            "value": undefined,
          },
        ],
      }
    `);
    expect(database.applyMigration).not.toHaveBeenCalled();
  });

  it(`should err if new migration versions are not incrementing`, async () => {
    fileSystem.findLocalMigrations.mockResolvedValue([
      {
        version: 1,
        fileName: `001.sql`,
        contents: () => Promise.resolve(`test`),
      },
      {
        version: 3,
        fileName: `003.sql`,
        contents: () => Promise.resolve(`test`),
      },
    ]);
    database.findAppliedMigrations.mockResolvedValue([]);

    const migrator = makeMigrate({
      makeDatabase,
      makeFancyOutput,
      makeFileSystem,
    });
    await migrator('migrations-dir', `postgres://localhost/database_name`);

    expect(fancyOutput.error).toMatchInlineSnapshot(`
      [MockFunction] {
        "calls": Array [
          Array [
            "Expected version '2' but found migration version '3'",
          ],
        ],
        "results": Array [
          Object {
            "type": "return",
            "value": undefined,
          },
        ],
      }
    `);
    expect(database.applyMigration).not.toHaveBeenCalled();
  });

  it(`should err if migration failed to apply`, async () => {
    fileSystem.findLocalMigrations.mockResolvedValue([
      {
        version: 1,
        fileName: `001.sql`,
        contents: () => Promise.resolve(`test`),
      },
    ]);
    database.findAppliedMigrations.mockResolvedValue([]);
    database.applyMigration.mockResolvedValue({
      success: false,
      e: {
        message: `Something went wrong when executing the migration`,
      },
    });

    const migrator = makeMigrate({
      makeDatabase,
      makeFancyOutput,
      makeFileSystem,
    });
    await migrator('migrations-dir', `postgres://localhost/database_name`);

    expect(database.applyMigration).toHaveBeenCalled();
    expect(fancyOutput.error).toMatchInlineSnapshot(`
      [MockFunction] {
        "calls": Array [
          Array [
            "001.sql: Something went wrong when executing the migration",
          ],
        ],
        "results": Array [
          Object {
            "type": "return",
            "value": undefined,
          },
        ],
      }
    `);
  });

  it(`should not err if migration was applied successfully`, async () => {
    fileSystem.findLocalMigrations.mockResolvedValue([
      {
        version: 1,
        fileName: `001.sql`,
        contents: () => Promise.resolve(`test`),
      },
    ]);
    database.findAppliedMigrations.mockResolvedValue([]);
    database.applyMigration.mockResolvedValue({
      success: true,
    });

    const migrator = makeMigrate({
      makeDatabase,
      makeFancyOutput,
      makeFileSystem,
    });
    await migrator('migrations-dir', `postgres://localhost/database_name`);

    expect(database.applyMigration).toMatchInlineSnapshot(`
      [MockFunction] {
        "calls": Array [
          Array [
            "test",
            1,
            "098f6bcd4621d373cade4e832627b4f6",
          ],
        ],
        "results": Array [
          Object {
            "type": "return",
            "value": Promise {},
          },
        ],
      }
    `);
    expect(fancyOutput.error).not.toHaveBeenCalled();
  });
});
