import { Expression, InternalExpression } from './expression';
import { GroupToken, ParameterToken, SeparatorToken, StringToken, Token } from './tokens';
import { toSnakeCase, wrapQuotes } from './naming';

import { DbConfig } from './config';
import { TableDefinition } from './table';
import { Uuid } from './data-types';

export interface ColumnDefinitionFormat {
  dataType: string;
  isNotNull: boolean;
  isPrimaryKey: boolean;
  defaultExpression?: string;
  checkExpression?: string;
  isUnique: boolean;
  referencesTable?: string;
  referencesSelf?: boolean;
  referencesColumn?: string;
  enumValues?: string[];
}

export interface ColumnDefinition<
  DataType,
  IsNotNull extends boolean = false,
  HasDefault extends boolean = false,
  IsPrimaryKey extends boolean = false,
> {
  notNull(): ColumnDefinition<DataType, true, HasDefault, IsPrimaryKey>;
  primaryKey(): ColumnDefinition<DataType, true, HasDefault, true>;

  default(expression: string): ColumnDefinition<DataType, IsNotNull, true, IsPrimaryKey>;
  check(expression: string): ColumnDefinition<DataType, IsNotNull, HasDefault, IsPrimaryKey>;
  unique(): ColumnDefinition<DataType, IsNotNull, HasDefault, IsPrimaryKey>;
  references<
    T extends TableDefinition<any>,
    ColumnName extends T extends TableDefinition<infer Columns>
      ? keyof Columns extends string
        ? keyof Columns
        : never
      : never,
  >(
    table: T,
    columnName: ColumnName,
  ): ColumnDefinition<
    DataType extends Uuid<any> ? Uuid<T> : DataType,
    IsNotNull,
    HasDefault,
    IsPrimaryKey
  >;
  referencesSelf(
    columnName: string,
  ): ColumnDefinition<DataType, IsNotNull, HasDefault, IsPrimaryKey>;

  /** @internal */
  getDefinition(): ColumnDefinitionFormat;
}

export const makeColumnDefinition = <
  DataType,
  IsNotNull extends boolean = false,
  HasDefault extends boolean = false,
>(
  dataType: string,
  enumValues?: string[],
): ColumnDefinition<DataType, IsNotNull, HasDefault> => {
  let isNotNull = false;
  let isPrimaryKey = false;
  let defaultExpression: string | undefined = undefined;
  let checkExpression: string | undefined = undefined;
  let isUnique = false;
  let referencesTable: any = undefined;
  let referencesSelf: boolean = false;
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
        referencesSelf,
        referencesColumn,
        enumValues,
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

    referencesSelf(columnName) {
      referencesSelf = true;
      referencesColumn = columnName;
      return this as any;
    },
  };
};

// This is only used as a nominal type, not actually as an instance.
export class ColumnSet<Columns> {
  private _columnSetBrand: any;

  /** @internal */
  toTokens(): Token[] {
    return [];
  }
}

export interface SharedColumn<
  Config extends DbConfig,
  Name extends string,
  TableName,
  DataType,
  IsNotNull extends boolean,
  HasDefault extends boolean,
  JoinType,
> {
  as<AliasName extends string>(
    alias: AliasName,
  ): Column<Config, AliasName, TableName, DataType, IsNotNull, HasDefault, JoinType>;

  /** @internal */
  toTokens(includeAlias?: boolean): Token[];

  /** @internal */
  getSnakeCaseName(): string;

  /** @internal */
  getName(): string;
}

export type AnyColumn = Column<any, any, any, any, any, any, any>;

export type Column<
  Config extends DbConfig,
  Name extends string,
  TableName,
  DataType,
  IsNotNull extends boolean,
  HasDefault extends boolean,
  JoinType,
> = SharedColumn<Config, Name, TableName, DataType, IsNotNull, HasDefault, JoinType> &
  Expression<Config, DataType, IsNotNull, Name>;

export class InternalColumn<
  Config extends DbConfig,
  Name extends string,
  TableName,
  DataType,
  IsNotNull extends boolean,
  HasDefault extends boolean,
  JoinType,
> extends InternalExpression<Config, DataType, IsNotNull, Name> {
  private _columnBrand: any;

  /** @internal */
  getSnakeCaseName() {
    return wrapQuotes(toSnakeCase(this.columnName));
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
        ? [
            new StringToken(
              `${wrapQuotes(tableName as unknown as string)}.${wrapQuotes(
                toSnakeCase(originalColumnName),
              )}`,
            ),
          ]
        : [
            new StringToken(
              `${wrapQuotes(tableName as unknown as string)}.${wrapQuotes(
                toSnakeCase(columnName),
              )}`,
            ),
          ],
      columnName as any,
    );
  }

  as<AliasName extends string>(
    alias: AliasName,
  ): Column<Config, AliasName, TableName, DataType, IsNotNull, HasDefault, JoinType> {
    return new InternalColumn(alias, this.tableName, this.columnName as unknown as string) as any;
  }

  /** @internal */
  toTokens(includeAlias?: boolean): Token[] {
    const snakeCaseColumnName = toSnakeCase(this.columnName as unknown as string);
    const toStringTokens = (tableName: TableName, columnName: string, alias?: string) => {
      const initialToken = new StringToken(
        `${wrapQuotes(tableName as unknown as string)}.${wrapQuotes(columnName)}`,
      );

      if (!alias) {
        return [initialToken];
      }

      return [initialToken, new StringToken(wrapQuotes(alias, true))];
    };

    if (includeAlias) {
      return this.originalColumnName
        ? toStringTokens(this.tableName, toSnakeCase(this.originalColumnName), this.columnName)
        : snakeCaseColumnName === (this.columnName as unknown)
        ? toStringTokens(this.tableName, snakeCaseColumnName)
        : toStringTokens(this.tableName, snakeCaseColumnName, this.columnName);
    }

    return this.originalColumnName
      ? toStringTokens(this.tableName, toSnakeCase(this.originalColumnName))
      : toStringTokens(this.tableName, snakeCaseColumnName);
  }
}
