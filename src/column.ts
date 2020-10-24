import { GroupToken, ParameterToken, SeparatorToken, StringToken, Token } from './tokens';
import { toSnakeCase, wrapQuotes } from './naming/snake-case';

import { Expression } from './expression';
import { TableDefinition } from './table';

export interface ColumnDefinitionFormat {
  dataType: string;
  isNotNull: boolean;
  isPrimaryKey: boolean;
  defaultExpression?: string;
  checkExpression?: string;
  isUnique: boolean;
  referencesTable?: string;
  referencesColumn?: string;
}

export interface ColumnDefinition<
  DataType,
  IsNotNull extends boolean = false,
  HasDefault extends boolean = false
> {
  notNull(): ColumnDefinition<DataType, true, HasDefault>;
  primaryKey(): ColumnDefinition<DataType, true, HasDefault>;
  // In most cases a default clause means you do not need to provide any value during insert. In
  // theory however it's possible the default expression doesn't set a value in some case. In the
  // case of a NOT NULL constraint this would mean you'd have to set a value when inserting. Because
  // this is not neccesary in most of the cases we just assume a default expression will always set
  // a value. You can opt out of this by setting `IsAlwaysSettingAValue` to false.
  default<IsAlwaysSettingAValue extends boolean = true>(
    expression: string,
  ): ColumnDefinition<DataType, IsNotNull, IsAlwaysSettingAValue>;
  check(expression: string): ColumnDefinition<DataType, IsNotNull, HasDefault>;
  unique(): ColumnDefinition<DataType, IsNotNull, HasDefault>;
  references<
    T extends TableDefinition<any>,
    ColumnName extends T extends TableDefinition<infer Columns> ? keyof Columns : never
  >(
    table: T,
    columnName: ColumnName,
  ): ColumnDefinition<DataType, IsNotNull, HasDefault>;

  /** @internal */
  getDefinition(): ColumnDefinitionFormat;
}

export const makeColumnDefinition = <
  DataType,
  IsNotNull extends boolean = false,
  HasDefault extends boolean = false
>(
  dataType: string,
): ColumnDefinition<DataType, IsNotNull, HasDefault> => {
  let isNotNull = false;
  let isPrimaryKey = false;
  let defaultExpression: string | undefined = undefined;
  let checkExpression: string | undefined = undefined;
  let isUnique = false;
  let referencesTable: any = undefined;
  let referencesColumn: string | undefined = undefined;

  return {
    getDefinition() {
      return {
        dataType,
        isNotNull,
        isPrimaryKey,
        defaultExpression,
        checkExpression,
        isUnique,
        referencesTable,
        referencesColumn,
      };
    },

    notNull() {
      isNotNull = true;

      return this as any;
    },

    primaryKey() {
      isPrimaryKey = true;

      return this as any;
    },

    default(expression) {
      defaultExpression = expression;

      return this as any;
    },

    check(expression) {
      checkExpression = expression;

      return this as any;
    },

    unique() {
      isUnique = true;

      return this as any;
    },

    references(table, columnName) {
      referencesTable = table;
      referencesColumn = columnName;

      return this as any;
    },
  };
};

export class Column<
  Name extends string,
  TableName,
  DataType,
  IsNotNull extends boolean,
  HasDefault extends boolean,
  JoinType
> extends Expression<DataType, IsNotNull, Name> {
  private _columnBrand: any;

  /** @internal */
  getSnakeCaseName() {
    return toSnakeCase(this.columnName);
  }

  /** @internal */
  getName() {
    return this.columnName;
  }

  constructor(
    private readonly columnName: Name,
    private readonly tableName: TableName,
    private readonly originalColumnName: string | undefined,
  ) {
    super(
      originalColumnName
        ? [new StringToken(`${tableName}.${toSnakeCase(originalColumnName)}`)]
        : [new StringToken(`${tableName}.${toSnakeCase((columnName as unknown) as string)}`)],
      columnName as any,
    );
  }

  as<AliasName extends string>(
    alias: AliasName,
  ): Column<AliasName, TableName, DataType, IsNotNull, HasDefault, JoinType> {
    return new Column(alias, this.tableName, (this.columnName as unknown) as string);
  }

  /** @internal */
  toTokens(includeAlias?: boolean): Token[] {
    const snakeCaseColumnName = toSnakeCase((this.columnName as unknown) as string);

    if (includeAlias) {
      return this.originalColumnName
        ? [
            new StringToken(`${this.tableName}.${toSnakeCase(this.originalColumnName)}`),
            new StringToken(wrapQuotes(this.columnName)),
          ]
        : snakeCaseColumnName === (this.columnName as unknown)
        ? [new StringToken(`${this.tableName}.${snakeCaseColumnName}`)]
        : [
            new StringToken(`${this.tableName}.${snakeCaseColumnName}`),
            new StringToken(wrapQuotes(this.columnName)),
          ];
    }

    return this.originalColumnName
      ? [new StringToken(`${this.tableName}.${toSnakeCase(this.originalColumnName)}`)]
      : [new StringToken(`${this.tableName}.${snakeCaseColumnName}`)];
  }
}
