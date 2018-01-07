import { Default, Keyword } from '../keywords';
import { PartialQuery } from '../query';
import { TableWrapper } from '../table';
import { CollectionToken, GroupToken, ParameterToken, StringToken, Token } from '../tokens';
import { Unsafe } from '../unsafe';

export interface ColumnConfig<T> {
	primary?: boolean;
	default?: T | string; // TODO: Instead of string this should be new Raw() or something.
	check?: string;
	notNull?: boolean;
	unique?: boolean;
	references?: {
		tableName: string;
		columnName: string;
	};
	columnFunction?: ColumnFunction<T, any>;
}
export type ColumnFunction<T, Db> = (db: Db) => Column<T, any, any, any>;

export type AggregateType = 'COUNT' | 'MIN' | 'MAX' | 'AVG' | 'SUM';

export class Column<T, IT = T | null, ST = T | null, UT = T> {
	dataType: string;

	/** @internal */
	type: T;
	/** @internal */
	insertType: IT;
	/** @internal */
	selectType: ST;
	/** @internal */
	updateType: UT;
	/** @internal */
	name?: string;
	/** @internal */
	key?: string;
	/** @internal */
	table?: TableWrapper<any>;

	config: ColumnConfig<T>;

  constructor(name?: string, config = {}) {
		this.name = name;

		// tslint:disable-next-line:no-object-literal-type-assertion
		this.type = {} as T;
		// tslint:disable-next-line:no-object-literal-type-assertion
		this.insertType = {} as IT;
		// tslint:disable-next-line:no-object-literal-type-assertion
		this.selectType = {} as ST;
		// tslint:disable-next-line:no-object-literal-type-assertion
		this.updateType = {} as UT;

		this.config = config;
	}

	/** @internal */
	getName() {
		// TODO: this should be a string, not string | undefined.
		return this.name;
	}

	/** @internal */
	setName(name: string) {
		this.name = name;
	}

	/** @internal */
	setKey(key: string) {
		this.key = key;
	}

	/** @internal */
  setTable<TW extends TableWrapper<any>>(table: TW) {
		// TODO: why do we need the complete table here? If it's just for the table's name, can we just set the name instead?
    this.table = table;
	}

	primary(): Column<T, T | null, T> {
		this.config.primary = true;

		return this as any as Column<T, T | null, T>;
	}

	primaryKey() {
		return this.primary();
	}

	unique() {
		this.config.unique = true;
		return this;
	}

	notNull(): Column<T, T, T> {
		this.config.notNull = true;

		return this as any as Column<T, T, T>;
	}

	check(sql: string) {
		this.config.check = sql;
		return this;
	}

	default(sql: T | Unsafe | Keyword): Column<T, T | null, ST, UT | Default> {
		this.config.default = (sql && (sql instanceof Unsafe || sql instanceof Keyword))
			? sql.toSql()
			: sql;
		return this as any as Column<T, T | null, ST, UT | Default>;
	}

	/** @internal */
	createReference<Db>(db: Db) {
		if (this.config.columnFunction) {
			const column = this.config.columnFunction(db);

			this.config.references = {
				tableName: column.table!.getName(),
				columnName: column.name!,
			};
			this.config.columnFunction = undefined;
		}
	}

	references<Db>(columnFunction: ColumnFunction<T, Db>) {
		this.config.columnFunction = columnFunction;
		return this;
	}

	// TODO: Move everything below this comment to a separate class e.g. QueryableColumn.
	// That way we can separate the schema-related methods and the query-related methods.

	private compare(value: T | Column<any> | PartialQuery, comparator: string) {
		const query = new PartialQuery();
		query.tokens.push(
			new StringToken(this.toSql()),
			new StringToken(comparator),
		);

		if (value instanceof Column) {
			query.tokens.push(new StringToken(`${value.table!.getName()}.${value.name}`));
		}
		else if (value instanceof PartialQuery) {
			query.tokens.push(...value.tokens);
		}
		else {
			query.tokens.push(new ParameterToken(value));
		}
		return query;
	}

	isNull() {
		const query = new PartialQuery();
		query.tokens.push(
			new StringToken(this.toSql()),
			new StringToken(`IS NULL`),
		);
		return query;
	}

	isNotNull() {
		const query = new PartialQuery();
		query.tokens.push(
			new StringToken(this.toSql()),
			new StringToken(`IS NOT NULL`),
		);
		return query;
	}

	asc() {
		return new PartialQuery(new StringToken(this.toSql()), new StringToken(`ASC`));
	}

	desc() {
		return new PartialQuery(new StringToken(this.toSql()), new StringToken(`DESC`));
	}

	in(array: T[]) {
		return new PartialQuery(
			new StringToken(`${this.table!.getName()}.${this.name}`),
			new StringToken(`IN`),
			new GroupToken([new ParameterToken(array)]),
		)
	}

	private aggregate(aggregateType: AggregateType) {
		// TODO: the selectType probably needs an update depending on the aggregate type?

		const aggregateColumn = new AggregateColumn<T, IT, ST, UT>(aggregateType, this.name!, this.key!);

		// TODO: this is a bit ugly. Is there anything else we need to set?
		aggregateColumn.table = this.table;
		return aggregateColumn;
	}

	toSql() {
		return `${this.table!.getName()}.${this.name}`;
	}

	toTokens(): Token[] {
		return [
			new StringToken(this.toSql()),
		];
	}

	count() { return this.aggregate(`COUNT`); }
	sum() { return this.aggregate(`SUM`); }
	min() { return this.aggregate(`MIN`); }
	max() { return this.aggregate(`MAX`); }
	avg() { return this.aggregate(`AVG`); }

	private operate(operator: '+' | '-' | '*' | '/' | '%', value: T) {
		return new PartialQuery(
			new StringToken(`${this.table!.getName()}.${this.name}`),
			new StringToken(operator),
			new ParameterToken(value),
		);
	}

	// TODO: should we add these on specific column types only? E.g. NumberColumn.
	plus(value: T) { return this.operate(`+`, value); }
	minus(value: T) { return this.operate(`+`, value); }
	multiply(value: T) { return this.operate(`+`, value); }
	divide(value: T) { return this.operate(`/`, value); }
	modulo(value: T) { return this.operate(`%`, value); }

	// TODO: should this only be on TextColumn exclusively?
	concat(value: T | Column<any>) {
		return new PartialQuery(
			new StringToken(this.toSql()),
			new StringToken(`||`),
			value instanceof Column
				? new CollectionToken(value.toTokens())
				: new ParameterToken(value),
		);
	}

	between(a: T, b: T) {
		return new PartialQuery(
			new StringToken(this.toSql()),
			new StringToken(`BETWEEN`),
			new ParameterToken(a),
			new StringToken(`AND`),
			new ParameterToken(b),
		);
	}

	eq(value: T | Column<any> | PartialQuery) { return this.compare(value, `=`); }
	ne(value: T | Column<any> | PartialQuery) { return this.compare(value, `!=`); }
	gt(value: T | Column<any> | PartialQuery) { return this.compare(value, `>`); }
	gte(value: T | Column<any> | PartialQuery) { return this.compare(value, `>=`); }
	lt(value: T | Column<any> | PartialQuery) { return this.compare(value, `>=`); }
	lte(value: T | Column<any> | PartialQuery) { return this.compare(value, `<=`); }
}

export class AggregateColumn<T, IT, ST, UT> extends Column<T, IT, ST, UT> {
	aggregateType: string;

	constructor(aggregateType: string, name: string, key: string) {
		super();

		this.aggregateType = aggregateType;
		this.name = name;
		this.key = key;
	}

	toTokens() {
		return [
			new GroupToken(
				[new StringToken(this.toSql())],
				`${this.aggregateType}(`,
				`)`,
			),
		];
	}
}

export class TextColumn extends Column<string> {
	dataType = 'TEXT';
}
export class CitextColumn extends Column<string> {
	dataType = 'CITEXT';
}
export class CaseInsensitiveTextColumn extends CitextColumn {}
export class IntegerColumn extends Column<number> {
	dataType = 'INTEGER';
}
export class DecimalColumn extends Column<number> {
	dataType = 'DECIMAL';
}
export class SerialColumn extends Column<number, number | null> {
	dataType = 'SERIAL';
}
export class JSONColumn<T> extends Column<T> {
	dataType = 'JSON';
}
export class JSONBColumn<T> extends Column<T> {
	dataType = 'JSONB';
}
export class TimestampWithTimeZoneColumn extends Column<Date> {
	dataType = 'TIMESTAMP WITH TIME ZONE';
}
export class TimestampWithoutTimeZoneColumn extends Column<Date> {
	dataType = 'TIMESTAMP WITHOUT TIME ZONE';
}

export type Uuid = string;

export class UuidColumn extends Column<Uuid> {
	dataType = 'UUID';
}

export class StringColumn extends TextColumn {}
export class NumberColumn extends IntegerColumn {}
export class DateColumn extends TimestampWithTimeZoneColumn {}