import { Column } from './columns';
import { Database } from './database';
import { PartialQuery, Query } from './query';

export class Table {
  [columnName: string]: Column<any>;
}

const toSnakeCase = (string: string) => string.replace(/([^A-Z]|[A-Z]{1,})([A-Z])/g, '$1_$2').toLowerCase();

export class TableWrapper<Row, InsertRow = Row, UpdateRow = Row> {
	private readonly $name: string;
  private readonly $columnNames: ReadonlyArray<keyof Row>;
  private $db?: Database;

  constructor(table: Table, name: string) {
		this.$name = toSnakeCase(name);
    this.$columnNames = Object.keys(table) as (keyof Row)[];

    const self = this as any;
    this.$columnNames.forEach(key => {
      const column = table[key];

      if (!column.getName()) {
        const columnName = toSnakeCase(key);
        column.setName(columnName);
      }

			column.setKey(key);

			// TODO: do we really need to set the complete table or can we just set the name?
			column.setTable(this);

			if (self[key]) {
				throw new Error(`Column \`${key}\` in table \`${name}\` collides with property of the same name in TableWrapper class.`);
			}

      self[key] = table[key];
    });
  }

  init(db: Database) {
    this.$db = db;

    const self = this as any;
    this.$columnNames.forEach(columnName => {
      const column: Column<any, any> = self[columnName];

      column.createReference(db);
    });
	}

	/** @internal */
	getColumns() {
		return this.$columnNames.map(columnName => this.getColumn(columnName) as Column<any>);
	}

	/** @internal */
  getColumn(columnName: string): Column<any> | undefined {
    return (this as any)[columnName];
  }

  /** @internal */
  getName() {
    return this.$name;
	}

	/** @internal */
	getDb() {
		return this.$db;
	}

  private query(): Query<this, Row, InsertRow, UpdateRow> {
		return new Query<this, Row, InsertRow, UpdateRow>(this);
	}

  select<SelectMap extends { [alias: string]: Column<any, any, string | number | Date | null, any> }>(columns: SelectMap): Query<this, Row, InsertRow, UpdateRow, { [P in keyof SelectMap]: SelectMap[P]['selectType'] }[]>;
  select<
		A extends keyof Row
	>(
		columnNameA: A,
	): Query<this, Row, InsertRow, UpdateRow, (
		{ [PA in A]: Row[PA]; }
	)[]>;
	select<
		A extends keyof Row,
		B extends keyof Row
	>(
		columnNameA: A,
		columnNameB: B,
	): Query<this, Row, InsertRow, UpdateRow, (
		{ [PA in A]: Row[PA]; } &
		{ [PB in B]: Row[PB]; }
	)[]>;
	select<
		A extends keyof Row,
		B extends keyof Row,
		C extends keyof Row
	>(
		columnNameA: A,
		columnNameB: B,
		columnNameC: C,
	): Query<this, Row, InsertRow, UpdateRow, (
		{ [PA in A]: Row[PA]; } &
		{ [PB in B]: Row[PB]; } &
		{ [PC in C]: Row[PC]; }
	)[]>;
	select<
		A extends keyof Row,
		B extends keyof Row,
		C extends keyof Row,
		D extends keyof Row
	>(
		columnNameA: A,
		columnNameB: B,
		columnNameC: C,
		columnNameD: D,
	): Query<this, Row, InsertRow, UpdateRow, (
		{ [PA in A]: Row[PA]; } &
		{ [PB in B]: Row[PB]; } &
		{ [PC in C]: Row[PC]; } &
		{ [PD in D]: Row[PD]; }
	)[]>;
	select<
		A extends keyof Row,
		B extends keyof Row,
		C extends keyof Row,
		D extends keyof Row,
		E extends keyof Row
	>(
		columnNameA: A,
		columnNameB: B,
		columnNameC: C,
		columnNameD: D,
		columnNameE: E,
	): Query<this, Row, InsertRow, UpdateRow, (
		{ [PA in A]: Row[PA]; } &
		{ [PB in B]: Row[PB]; } &
		{ [PC in C]: Row[PC]; } &
		{ [PD in D]: Row[PD]; } &
		{ [PE in E]: Row[PE]; }
	)[]>;
	select<
		A extends keyof Row,
		B extends keyof Row,
		C extends keyof Row,
		D extends keyof Row,
		E extends keyof Row,
		F extends keyof Row
	>(
		columnNameA: A,
		columnNameB: B,
		columnNameC: C,
		columnNameD: D,
		columnNameE: E,
		columnNameF: F,
	): Query<this, Row, InsertRow, UpdateRow, (
		{ [PA in A]: Row[PA]; } &
		{ [PB in B]: Row[PB]; } &
		{ [PC in C]: Row[PC]; } &
		{ [PD in D]: Row[PD]; } &
		{ [PE in E]: Row[PE]; } &
		{ [PF in F]: Row[PF]; }
	)[]>;
	select<
		A extends keyof Row,
		B extends keyof Row,
		C extends keyof Row,
		D extends keyof Row,
		E extends keyof Row,
		F extends keyof Row,
		G extends keyof Row
	>(
		columnNameA: A,
		columnNameB: B,
		columnNameC: C,
		columnNameD: D,
		columnNameE: E,
		columnNameF: F,
		columnNameG: G,
	): Query<this, Row, InsertRow, UpdateRow, (
		{ [PA in A]: Row[PA]; } &
		{ [PB in B]: Row[PB]; } &
		{ [PC in C]: Row[PC]; } &
		{ [PD in D]: Row[PD]; } &
		{ [PE in E]: Row[PE]; } &
		{ [PF in F]: Row[PF]; } &
		{ [PG in G]: Row[PG]; }
	)[]>;
	select<
		A extends keyof Row,
		B extends keyof Row,
		C extends keyof Row,
		D extends keyof Row,
		E extends keyof Row,
		F extends keyof Row,
		G extends keyof Row,
		H extends keyof Row
	>(
		columnNameA: A,
		columnNameB: B,
		columnNameC: C,
		columnNameD: D,
		columnNameE: E,
		columnNameF: F,
		columnNameG: G,
		columnNameH: H,
	): Query<this, Row, InsertRow, UpdateRow, (
		{ [PA in A]: Row[PA]; } &
		{ [PB in B]: Row[PB]; } &
		{ [PC in C]: Row[PC]; } &
		{ [PD in D]: Row[PD]; } &
		{ [PE in E]: Row[PE]; } &
		{ [PF in F]: Row[PF]; } &
		{ [PG in G]: Row[PG]; } &
		{ [PH in H]: Row[PH]; }
	)[]>;
	select<
		A extends keyof Row,
		B extends keyof Row,
		C extends keyof Row,
		D extends keyof Row,
		E extends keyof Row,
		F extends keyof Row,
		G extends keyof Row,
		H extends keyof Row
	>(
		columnNameA: A,
		columnNameB?: B,
		columnNameC?: C,
		columnNameD?: D,
		columnNameE?: E,
		columnNameF?: F,
		columnNameG?: G,
		columnNameH?: H,
	) {
    if (typeof columnNameA === 'object') {
      return this.query().selectWithAlias(columnNameA);
    }

    return this.query().selectWithStrings(
      columnNameA,
      columnNameB,
      columnNameC,
      columnNameD,
      columnNameE,
      columnNameF,
      columnNameG,
      columnNameH,
    );
  }

  object(object: InsertRow): InsertRow {
    return object;
  }

	insert(object: InsertRow) {
		return this.query().insert(object);
  }

  update(object: { [P in keyof UpdateRow]?: UpdateRow[P] | PartialQuery}) {
    return this.query().update(object);
  }
};


