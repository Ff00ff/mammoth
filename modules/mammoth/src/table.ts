import { Column, toSnakeCase, ColumnWrapper } from './columns';

export class TableType {
  [columnName: string]: Column<any>;
}

export class Table<Row, InsertRow = Row, UpdateRow = Row> {
  private readonly $name: string;
  private readonly $columnNames: ReadonlyArray<keyof Row>;
  private readonly $userDefinedTable: TableType;

  $row: Row;
  $insertRow: InsertRow;
  $updateRow: UpdateRow;

  constructor(userDefinedTable: TableType, name: string) {
    this.$userDefinedTable = userDefinedTable;
    this.$name = toSnakeCase(name);
    this.$columnNames = Object.keys(userDefinedTable) as (keyof Row)[];

    const self = this as any;
    this.$columnNames.forEach(camelCaseName => {
      const column = userDefinedTable[camelCaseName as string];
      if (!(column instanceof Column)) {
        throw new Error(`Invalid column at ${name}#${camelCaseName}`);
      }

      const snakeCaseName = column.getSnakeCaseName(camelCaseName as string);

      if (self[camelCaseName]) {
        throw new Error(
          `Column \`${camelCaseName}\` in table \`${name}\` collides with property of the same name in TableWrapper class.`,
        );
      }

      // TODO: change ColumnWrapper to Column instead ?!
      self[camelCaseName] = new ColumnWrapper(this, column, camelCaseName as string, snakeCaseName);
    });

    this.$row = undefined as any;
    this.$insertRow = undefined as any;
    this.$updateRow = undefined as any;
  }

  init() {
    this.$columnNames.forEach(columnName => {
      const column = this.$userDefinedTable[columnName as string];

      column.createReference();
    });
  }

  /** @internal */
  getColumns() {
    return this.$columnNames.map(columnName => this.getColumn(columnName)!);
  }

  /** @internal */
  getColumn(columnName: string | symbol | number): ColumnWrapper<any, any, any, any, any> {
    return (this as any)[columnName];
  }

  /** @internal */
  getName() {
    return this.$name;
  }
}
