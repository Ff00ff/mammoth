import { ColumnWrapper } from '.';
import { Column, toSnakeCase } from './columns';

export class Table {
  [columnName: string]: Column<any>;
}

export class TableWrapper<Row, InsertRow = Row, UpdateRow = Row> {
  private readonly $name: string;
  private readonly $columnNames: ReadonlyArray<keyof Row>;
  private readonly $table: Table;

  $row: Row;
  $insertRow: InsertRow;
  $updateRow: UpdateRow;

  constructor(table: Table, name: string) {
    this.$table = table;
    this.$name = toSnakeCase(name);
    this.$columnNames = Object.keys(table) as (keyof Row)[];

    const self = this as any;
    this.$columnNames.forEach(camelCaseName => {
      const column = table[camelCaseName as string];
      const snakeCaseName = column.getSnakeCaseName(camelCaseName as string);

      if (self[camelCaseName]) {
        throw new Error(
          `Column \`${camelCaseName}\` in table \`${name}\` collides with property of the same name in TableWrapper class.`,
        );
      }

      self[camelCaseName] = new ColumnWrapper(this, column, camelCaseName as string, snakeCaseName);
    });

    this.$row = undefined as any;
    this.$insertRow = undefined as any;
    this.$updateRow = undefined as any;
  }

  init(db: any) {
    this.$columnNames.forEach(columnName => {
      const column = this.$table[columnName as string];

      column.createReference(db);
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
