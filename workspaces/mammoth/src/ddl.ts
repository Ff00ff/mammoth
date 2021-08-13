import {
  CollectionToken,
  GroupToken,
  ParameterToken,
  SeparatorToken,
  StringToken,
  Token,
  createQueryState,
} from './tokens';
import { ColumnDefinition, ColumnDefinitionFormat } from './column';
import { Err, QueryExecutorFn } from './types';
import { toSnakeCase, wrapQuotes } from './naming';

import { stringAgg } from './sql-functions';

const createColumnConfigTokens = ({
  dataType,
  config,
}: {
  config?: InternalColumnConfig;
  dataType: string;
}): Token[] => {
  return [
    new StringToken(dataType),
    config?.isPrimaryKey && new StringToken(`PRIMARY KEY`),
    config?.isNotNull && new StringToken(`NOT NULL`),
    config?.isUnique && new StringToken(`UNIQUE`),
    config?.referenceTableName &&
      new CollectionToken([
        new StringToken(`REFERENCES`),
        new StringToken(toSnakeCase(config.referenceTableName)),
        new GroupToken([
          new SeparatorToken(
            ',',
            config.referenceColumnNames!.map(
              (columnName) => new StringToken(toSnakeCase(columnName)),
            ),
          ),
        ]),
      ]),
    config?.defaultExpression &&
      new CollectionToken([new StringToken(`DEFAULT`), new StringToken(config.defaultExpression)]),
    config?.checkExpression &&
      new CollectionToken([
        new StringToken(`CHECK`),
        new GroupToken([new StringToken(config.checkExpression)]),
      ]),
  ].filter((val) => !!val) as any;
};

const makeDefinitionQuery = (queryExecutor: QueryExecutorFn, tokens: Token[]) => {
  return {
    then() {
      //
    },

    async exec() {
      //
    },

    /** @internal */
    toTokens() {
      return tokens;
    },
  };
};

const makeAlterTableQuery = (
  queryExecutor: QueryExecutorFn,
  tableName: string,
  actions: Token[],
) => {
  return {
    ...makeDefinitionQuery(queryExecutor, [
      new StringToken(`ALTER TABLE`),
      new StringToken(toSnakeCase(tableName)),
      new SeparatorToken(',', actions),
    ]),
    dropColumn(columnName: string) {
      return makeAlterTableQuery(queryExecutor, tableName, [
        ...actions,
        new CollectionToken([
          new StringToken(`DROP COLUMN`),
          new StringToken(toSnakeCase(columnName)),
        ]),
      ]);
    },
    dropColumnIfExists(columnName: string) {
      return makeAlterTableQuery(queryExecutor, tableName, [
        ...actions,
        new CollectionToken([
          new StringToken(`DROP COLUMN`),
          new StringToken(toSnakeCase(columnName)),
        ]),
      ]);
    },

    addColumn(columnName: string, columnConfig: ColumnConfig) {
      const config = columnConfig.getConfig();

      return makeAlterTableQuery(queryExecutor, tableName, [
        ...actions,
        new CollectionToken([
          new StringToken(`ADD COLUMN`),
          new StringToken(toSnakeCase(columnName)),
          ...createColumnConfigTokens(config),
        ]),
      ]);
    },

    alterColumn(columnName: string) {
      return {
        dropNotNull() {
          return makeAlterTableQuery(queryExecutor, tableName, [
            ...actions,
            new CollectionToken([
              new StringToken(`ALTER COLUMN`),
              new StringToken(toSnakeCase(columnName)),
              new StringToken(`DROP NOT NULL`),
            ]),
          ]);
        },
        setNotNull() {
          return makeAlterTableQuery(queryExecutor, tableName, [
            ...actions,
            new CollectionToken([
              new StringToken(`ALTER COLUMN`),
              new StringToken(toSnakeCase(columnName)),
              new StringToken(`SET NOT NULL`),
            ]),
          ]);
        },
        dropDefault() {
          return makeAlterTableQuery(queryExecutor, tableName, [
            ...actions,
            new CollectionToken([
              new StringToken(`ALTER COLUMN`),
              new StringToken(toSnakeCase(columnName)),
              new StringToken(`DROP DEFAULT`),
            ]),
          ]);
        },
        setDefault(expression: string) {
          return makeAlterTableQuery(queryExecutor, tableName, [
            ...actions,
            new CollectionToken([
              new StringToken(`ALTER COLUMN`),
              new StringToken(toSnakeCase(columnName)),
              new StringToken(`SET DEFAULT`),
              new StringToken(expression),
            ]),
          ]);
        },
        setDataType(dataType: string) {
          return {
            ...makeAlterTableQuery(queryExecutor, tableName, [
              ...actions,
              new CollectionToken([
                new StringToken(`ALTER COLUMN`),
                new StringToken(toSnakeCase(columnName)),
                new StringToken(`SET DATA TYPE`),
                new StringToken(dataType),
              ]),
            ]),
            using(expression: string) {
              return makeAlterTableQuery(queryExecutor, tableName, [
                ...actions,
                new CollectionToken([
                  new StringToken(`ALTER COLUMN`),
                  new StringToken(toSnakeCase(columnName)),
                  new StringToken(`SET DATA TYPE`),
                  new StringToken(dataType),
                  new StringToken(`USING`),
                  new StringToken(expression),
                ]),
              ]);
            },
          };
        },
      };
    },

    renameTo(newTableName: string) {
      return makeAlterTableQuery(queryExecutor, tableName, [
        ...actions,
        new CollectionToken([
          new StringToken(`RENAME TO`),
          new StringToken(toSnakeCase(newTableName)),
        ]),
      ]);
    },

    renameColumn(columnName: string, newColumnName: string) {
      return makeAlterTableQuery(queryExecutor, tableName, [
        ...actions,
        new CollectionToken([
          new StringToken(`RENAME COLUMN`),
          new StringToken(toSnakeCase(columnName)),
          new StringToken(`TO`),
          new StringToken(toSnakeCase(newColumnName)),
        ]),
      ]);
    },

    dropConstraint(constraintName: string) {
      return makeAlterTableQuery(queryExecutor, tableName, [
        ...actions,
        new CollectionToken([
          new StringToken(`DROP CONSTRAINT`),
          new StringToken(wrapQuotes(constraintName)),
        ]),
      ]);
    },

    addConstraint(constraintName: string) {
      return {
        check(checkExpression: string) {
          return makeAlterTableQuery(queryExecutor, tableName, [
            ...actions,
            new CollectionToken([
              new StringToken(`ADD CONSTRAINT`),
              new StringToken(wrapQuotes(constraintName)),
              new StringToken(`CHECK`),
              new GroupToken([new StringToken(checkExpression)]),
            ]),
          ]);
        },
        uniqueUsingIndex(indexName: string) {
          return makeAlterTableQuery(queryExecutor, tableName, [
            ...actions,
            new CollectionToken([
              new StringToken(`ADD CONSTRAINT`),
              new StringToken(wrapQuotes(constraintName)),
              new StringToken(`UNIQUE USING INDEX`),
              new StringToken(wrapQuotes(indexName)),
            ]),
          ]);
        },
        primaryKeyUsingIndex(indexName: string) {
          return makeAlterTableQuery(queryExecutor, tableName, [
            ...actions,
            new CollectionToken([
              new StringToken(`ADD CONSTRAINT`),
              new StringToken(wrapQuotes(constraintName)),
              new StringToken(`PRIMARY KEY USING INDEX`),
              new StringToken(wrapQuotes(indexName)),
            ]),
          ]);
        },
        unique(...columnNames: string[]) {
          return makeAlterTableQuery(queryExecutor, tableName, [
            ...actions,
            new CollectionToken([
              new StringToken(`ADD CONSTRAINT`),
              new StringToken(wrapQuotes(constraintName)),
              new StringToken(`UNIQUE`),
              new GroupToken([
                new SeparatorToken(
                  `,`,
                  columnNames.map((columnName) => new StringToken(toSnakeCase(columnName))),
                ),
              ]),
            ]),
          ]);
        },
        primaryKey(...columnNames: string[]) {
          return makeAlterTableQuery(queryExecutor, tableName, [
            ...actions,
            new CollectionToken([
              new StringToken(`ADD CONSTRAINT`),
              new StringToken(wrapQuotes(constraintName)),
              new StringToken(`PRIMARY KEY`),
              new GroupToken([
                new SeparatorToken(
                  `,`,
                  columnNames.map((columnName) => new StringToken(toSnakeCase(columnName))),
                ),
              ]),
            ]),
          ]);
        },
        foreignKey(...columnNames: string[]) {
          return {
            references(referenceTableName: string, ...referenceColumnNames: string[]) {
              return makeAlterTableQuery(queryExecutor, tableName, [
                ...actions,
                new CollectionToken([
                  new StringToken(`ADD CONSTRAINT`),
                  new StringToken(wrapQuotes(constraintName)),
                  new StringToken(`FOREIGN KEY`),
                  new GroupToken([
                    new SeparatorToken(
                      `,`,
                      columnNames.map((columnName) => new StringToken(toSnakeCase(columnName))),
                    ),
                  ]),
                  new StringToken(`REFERENCES`),
                  new StringToken(toSnakeCase(referenceTableName)),
                  new GroupToken(
                    referenceColumnNames.map(
                      (columnName) => new StringToken(toSnakeCase(columnName)),
                    ),
                  ),
                ]),
              ]);
            },
          };
        },
      };
    },
  };
};

type Constraint = PrimaryKeyConstraint | UniqueConstraint | ForeignKeyConstraint | CheckConstraint;

interface CheckConstraint {
  type: `CHECK`;
  expression: string;
  name?: string;
}

interface PrimaryKeyConstraint {
  type: `PRIMARY_KEY`;
  columnNames: string[];
  name?: string;
}

interface UniqueConstraint {
  type: `UNIQUE`;
  columnNames: string[];
  name?: string;
}

interface ForeignKeyConstraint {
  type: `FOREIGN_KEY`;
  columnNames: string[];
  referenceTableName: string;
  referenceColumnNames: string[];
  name?: string;
}

const createConstraintTokens = (constraint: Constraint) => {
  switch (constraint.type) {
    case 'CHECK':
      return [new StringToken(`CHECK`), new GroupToken([new StringToken(constraint.expression)])];

    case `PRIMARY_KEY`:
      return [
        new StringToken(`PRIMARY KEY`),
        new GroupToken([
          new SeparatorToken(
            `,`,
            constraint.columnNames.map((columnName) => new StringToken(toSnakeCase(columnName))),
          ),
        ]),
      ];

    case `UNIQUE`:
      return [
        new StringToken(`UNIQUE`),
        new GroupToken([
          new SeparatorToken(
            `,`,
            constraint.columnNames.map((columnName) => new StringToken(toSnakeCase(columnName))),
          ),
        ]),
      ];

    case `FOREIGN_KEY`:
      return [
        new StringToken(`FOREIGN KEY`),
        new GroupToken([
          new SeparatorToken(
            `,`,
            constraint.columnNames.map((columnName) => new StringToken(toSnakeCase(columnName))),
          ),
        ]),
        new StringToken(`REFERENCES`),
        new StringToken(toSnakeCase(constraint.referenceTableName)),
        new GroupToken(
          constraint.referenceColumnNames.map(
            (columnName) => new StringToken(toSnakeCase(columnName)),
          ),
        ),
      ];
  }
};

export const makeConstraints = (constraintName?: string) => {
  return {
    check(checkExpression: string): CheckConstraint {
      return {
        type: `CHECK`,
        expression: checkExpression,
        name: constraintName,
      };
    },
    unique(...columnNames: string[]): UniqueConstraint {
      return {
        type: `UNIQUE`,
        columnNames,
        name: constraintName,
      };
    },
    primaryKey(...columnNames: string[]): PrimaryKeyConstraint {
      return {
        type: `PRIMARY_KEY`,
        columnNames,
        name: constraintName,
      };
    },
    foreignKey(...columnNames: string[]) {
      return {
        references(
          referenceTableName: string,
          ...referenceColumnNames: string[]
        ): ForeignKeyConstraint {
          return {
            type: `FOREIGN_KEY`,
            columnNames,
            referenceTableName,
            referenceColumnNames,
            name: constraintName,
          };
        },
      };
    },
  };
};

interface InternalColumnConfig {
  isNotNull?: boolean;
  isPrimaryKey?: boolean;
  defaultExpression?: string;
  checkExpression?: string;
  isUnique?: boolean;
  referenceTableName?: string;
  referenceColumnNames?: string[];
}

type ColumnConfig = ReturnType<typeof makeColumnConfig>;

const makeColumnConfig = (dataType: string, config?: InternalColumnConfig) => ({
  /** @internal **/
  getConfig() {
    return {
      dataType,
      config,
    };
  },

  notNull() {
    return makeColumnConfig(dataType, {
      ...config,
      isNotNull: true,
    });
  },
  default(expression: string) {
    return makeColumnConfig(dataType, {
      ...config,
      defaultExpression: expression,
    });
  },
  check(expression: string) {
    return makeColumnConfig(dataType, {
      ...config,
      checkExpression: expression,
    });
  },
  primaryKey() {
    return makeColumnConfig(dataType, {
      ...config,
      isPrimaryKey: true,
    });
  },
  references(referenceTableName: string, referenceColumnNames: string[]) {
    return makeColumnConfig(dataType, {
      ...config,
      referenceTableName,
      referenceColumnNames,
    });
  },
  unique() {
    return makeColumnConfig(dataType, {
      ...config,
      isUnique: true,
    });
  },
});

export const defineDdl = (db: { getQueryExecutor(): any }) => {
  const queryExecutor = db.getQueryExecutor();

  return {
    ...makeConstraints(),

    dataType(dataType: string) {
      return makeColumnConfig(dataType);
    },

    query() {},

    constraint<T extends string>(constraintName: T) {
      return makeConstraints(constraintName) as any;
    },

    alterTable(tableName: string) {
      return makeAlterTableQuery(queryExecutor, tableName, []);
    },

    createUniqueIndexConcurrently() {},
    createIndexConcurrently() {},
    createUniqueIndex() {},
    createIndex(indexName: string) {
      return {
        on(tableName: string) {
          return {
            ...makeDefinitionQuery(queryExecutor, []),
            using(method: string, expression?: string) {},
            with(expression: string) {},
            where(predicate: string) {},
          };
        },
      };
    },

    truncate(...tableNames: string[]) {
      const makeTruncate = (...tokens: Token[]) => {
        const initialTokens = [
          new StringToken(`TRUNCATE`),
          new SeparatorToken(
            ',',
            tableNames.map((tableName) => new StringToken(toSnakeCase(tableName))),
          ),
        ];
        return {
          ...makeDefinitionQuery(queryExecutor, [...initialTokens, ...tokens]),
          cascade() {
            return makeDefinitionQuery(queryExecutor, [
              ...initialTokens,
              ...tokens,
              new StringToken(`CASCADE`),
            ]);
          },
          restrict() {
            return makeDefinitionQuery(queryExecutor, [
              ...initialTokens,
              ...tokens,
              new StringToken(`RESTRICT`),
            ]);
          },
        };
      };

      return {
        ...makeTruncate(),
        restartIdentity() {
          return makeTruncate(new StringToken(`RESTART IDENTITY`));
        },
        continueIdentity() {
          return makeTruncate(new StringToken(`CONTINUE IDENTITY`));
        },
      };
    },

    dropTable() {
      //
    },

    dropTableIfNotExists() {},

    createTableIfNotExists(
      tableName: string,
      columns: { [columnName: string]: ColumnDefinition<any, any, any> },
      constraints: Constraint[],
    ) {
      //
    },

    createTable(
      tableName: string,
      columns: { [columnName: string]: ColumnDefinition<any, any, any> },
      ...constraints: Constraint[]
    ) {
      return makeDefinitionQuery(queryExecutor, [
        new StringToken(`CREATE TABLE`),
        new StringToken(toSnakeCase(tableName)),
        new GroupToken([
          new SeparatorToken(',', [
            ...Object.keys(columns).map((columnName) => {
              const column = columns[columnName];

              const definition = column.getDefinition();

              return new CollectionToken([
                new StringToken(toSnakeCase(columnName)),
                ...createColumnConfigTokens(definition),
              ]);
            }),
            ...constraints?.map((constraint) => {
              const tokens = createConstraintTokens(constraint);

              if (constraint.name) {
                return new CollectionToken([
                  new StringToken(`CONSTRAINT`),
                  new StringToken(wrapQuotes(constraint.name)),
                  ...tokens,
                ]);
              } else {
                return new CollectionToken(tokens);
              }
            }),
          ]),
        ]),
      ]);
    },
  };
};
