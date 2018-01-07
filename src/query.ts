
import { Column } from './columns';
import { Keyword } from './database';
import { TableWrapper } from './table';
import { CollectionToken, GroupToken, ParameterToken, SeparatorToken, StringToken, Token } from './tokens';

export interface Tokenable {
	toTokens(): Token[];
}

export class QueryBuilder {
	tokens: Token[] = [];
}

export interface State {
	text: string[];
	parameters: any[];
}

export interface QueryState {
	text: string;
	parameters: any[];
}

export const createState = (tokens: Token[], numberOfParameters: number): State => {
	const initialState = {
		text: [],
		parameters: [],
	};

	return tokens.reduce((tokenState, token) =>
		token.reduce(tokenState, tokenState.parameters.length + numberOfParameters), initialState);
}

export type QueryType = 'COUNT' | 'ROWS';

export class Query<T extends TableWrapper<Row, InsertRow, UpdateRow>, Row, InsertRow, UpdateRow, Ret = void, SingleRet = void> {
	tokens: Token[] = [];
	table: T;
	private type: QueryType;

	constructor(table: T) {
		this.type = 'COUNT';
		this.table = table;
	}

	async first(): Promise<SingleRet | undefined> {
		const ret = await this.exec();

		switch (this.type) {
			case 'COUNT': return undefined;
			case 'ROWS': return (ret as any)[0];
		}
	}

	async exec(): Promise<Ret> {
		const query = this.toQuery();
		const result = await this.table.getDb()!.exec(query.text, query.parameters);

		switch (this.type) {
			case 'COUNT': return result.rowCount as any as Ret;
			case 'ROWS': return result.rows as any as Ret;
		}
	}

	async then(onFulfilled?: ((value: Ret) => Ret | PromiseLike<Ret>) | undefined | null, onRejected?: ((reason: any) => void | PromiseLike<void>) | undefined | null) {
		try {
			const ret = await this.exec();

			if (onFulfilled) {
				return onFulfilled(ret)
			}
		}
		catch (e) {
			if (onRejected) {
				return onRejected(e);
			}
		}
	}

	toQuery(): QueryState {
		const state = createState(this.tokens, 0);

		return {
			text: state.text.join(' '),
			parameters: state.parameters,
		};
	}

  append(strings?: TemplateStringsArray, parameters?: any[]): void {
		if (!strings) {
			return;
		}

    for (let i = 0; i < strings.length; i += 1) {
			const string = strings[i];

			if (string.length > 0) {
				this.tokens.push(new StringToken(string));
			}

			if (parameters && i < parameters.length) {
				const parameter = parameters[i];

				if (parameter instanceof Query) {
          const query = parameter;

					this.tokens.push(...query.tokens);
				}
				else if (parameter instanceof Token) {
					this.tokens.push(parameter);
				}
				else if (Array.isArray(parameter) && parameter.length > 0 && parameter[0] instanceof Query) {
          // We assume everything in the array is a query now. This is tricky.

					for (let j = 0, jl = parameter.length; j < jl; j++) {
						const subinstance = parameter[j];

						this.tokens.push(...subinstance.tokens);

						if (j + 1< jl) {
							this.tokens.push(new StringToken(', '));
						}
					}
				}
				else {
					this.tokens.push(new ParameterToken(parameter));
				}
			}
    }
	}

	selectWithAlias<
		SelectMap extends { [alias: string]: Column<string | number | Date> },
		R = { [P in keyof SelectMap]: SelectMap[P]['selectType'] }
	>(columns: SelectMap): Query<T, Row, InsertRow, UpdateRow, R, R[]> {
		this.type = 'ROWS';

		this.append `SELECT`;
		this.tokens.push(new SeparatorToken(`,`, Object.keys(columns)
			.map(alias => {
				const column = columns[alias];

				// TODO: if this is an AggregateType get the correct sql. I guess we should use toTokens()?

				return new CollectionToken([
					...column.toTokens(),
					new StringToken(`AS "${alias}"`),
				]);
			})
		));

		return this as any as Query<T, Row, InsertRow, UpdateRow, R, R[]>;
	}

	selectWithStrings<
		A extends keyof Row,
		B extends keyof Row,
		C extends keyof Row,
		D extends keyof Row,
		E extends keyof Row,
		F extends keyof Row,
		G extends keyof Row,
		H extends keyof Row,
		R = (
			{ [PA in A]: Row[PA]; } &
			{ [PB in B]: Row[PB]; } &
			{ [PC in C]: Row[PC]; } &
			{ [PD in D]: Row[PD]; } &
			{ [PE in E]: Row[PE]; } &
			{ [PF in F]: Row[PF]; } &
			{ [PG in G]: Row[PG]; } &
			{ [PH in H]: Row[PH]; }
		)
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
		this.type = 'ROWS';
		this.tokens.push(
			new StringToken(`SELECT`),
			new SeparatorToken(`,`, [
					columnNameA,
					columnNameB,
					columnNameC,
					columnNameD,
					columnNameE,
					columnNameF,
					columnNameG,
					columnNameH,
				]
				.filter(columnName => columnName)
				.map(columnName => {
					const column = this.table.getColumn(columnName!);
					return new StringToken(`${this.table.getName()}.${column!.name!}`);
				})
			)
		);

		return this as any as Query<T, Row, InsertRow, UpdateRow, R[], R>;
	}

	from(table: T) {
		this.append `FROM`;
		this.tokens.push(new StringToken(table.getName()));
		return this;
	}

	limit(limit: number | 'ALL') {
		this.append `LIMIT`;

		if (typeof limit === 'number') {
			this.tokens.push(new StringToken(String(limit)));
		}
		else {
			this.tokens.push(new StringToken(`ALL`));
		}

		return this;
	}

	offset(offset: number) {
		this.tokens.push(new StringToken(`OFFSET ${offset}`));
		return this;
	}

	innerJoin(table: TableWrapper<any>) {
		this.tokens.push(
			new StringToken(`INNER JOIN`),
			new StringToken(table.getName()),
		);
		return this;
	}

	leftJoin(table: TableWrapper<any>) {
		this.tokens.push(
			new StringToken(`LEFT JOIN`),
			new StringToken(table.getName()),
		);
		return this;
	}

	rightJoin(table: TableWrapper<any>) {
		this.tokens.push(
			new StringToken(`RIGHT JOIN`),
			new StringToken(table.getName()),
		);
		return this;
	}

	leftOuterJoin(table: TableWrapper<any>) {
		this.tokens.push(
			new StringToken(`LEFT OUTER JOIN`),
			new StringToken(table.getName()),
		);
		return this;
	}

	rightOuterJoin(table: TableWrapper<any>) {
		this.tokens.push(
			new StringToken(`RIGHT OUTER JOIN`),
			new StringToken(table.getName()),
		);
		return this;
	}

	// TODO: if we set a type of the joined table somewhere we could make this a bit safer?
	on(tokenable: Tokenable) {
		this.append `ON`;
		this.tokens.push(...tokenable.toTokens());
		return this;
	}

	where(tokenable: Tokenable) {
		this.append `WHERE`;
		this.tokens.push(...tokenable.toTokens());
		return this;
	}

	private getColumn(key: string): Column<any> | undefined {
		return (this.table as any)[key];
	}

	insert(object: InsertRow) {
		const value: any = object;

		// TODO: Maybe we can change this to one tokens.push call? Let's first run a benchmark to see what is better.
		this.append `INSERT INTO`;
		this.tokens.push(new StringToken(this.table.getName()));

		const keys = Object.keys(object).filter(key => value[key] !== null);

		if (keys.length === 0) {
			this.tokens.push(new StringToken(`DEFAULT VALUES`));
		}
		else {
			this.tokens.push(new GroupToken([
				new SeparatorToken(',', keys.map(key => this.getColumn(key))
																		.filter(column => Boolean(column))
																		.map(column => new StringToken(column!.name!))),
			]));
			this.append `VALUES`;
			this.tokens.push(
				new GroupToken([
					new SeparatorToken(',', keys.map(key => new ParameterToken(value[key]))),
				]),
			);
		}

		return this as any as Query<T, Row, InsertRow, UpdateRow, number>;
	}

	update(object: { [P in keyof UpdateRow]?: UpdateRow[P] | PartialQuery }) {
		const keys = Object.keys(object) as (keyof Row)[];

		// TODO: What if keys is empty? update(object: {}): void?

		this.tokens.push(
			new StringToken(`UPDATE`),
			new StringToken(this.table.getName()),
			new StringToken(`SET`),
			new SeparatorToken(`,`,
				keys
					.map(columnName => this.getColumn(columnName))
					.filter(column => Boolean(column))
					.map(column => {
						const value = (object as any)[column!.key!];

						return value && value.toTokens
							? new CollectionToken([
								new StringToken(column!.name!),
								new StringToken(`=`),
								...value.toTokens(),
							])
							: new CollectionToken([
								new StringToken(column!.name!),
								new StringToken(`=`),
								new ParameterToken(value),
							]);
					}),
			),
		);

		return this;
	}

	onConflict(...columnNames: (keyof Row)[]) {
		// TODO: It's also possible to specify ON CONSTRAINT :constraintName.
		this.tokens.push(
			new StringToken(`ON CONFLICT`),
			new GroupToken([
				new SeparatorToken(`,`, columnNames
					.map(columnName => this.getColumn(columnName))
					.filter(column => Boolean(column))
					.map(column => new StringToken(column!.key!))),
			]),
		);
		return this;
	}

	doNothing() {
		this.tokens.push(new StringToken(`DO NOTHING`));
		return this;
	}

	doUpdate(object: Partial<UpdateRow>) {
		const keys = Object.keys(object);

		this.tokens.push(
			new StringToken(`DO UPDATE SET`),
			new SeparatorToken(`,`,
				keys
					.map(columnName => this.getColumn(columnName))
					.filter(column => Boolean(column))
					.map(column => {
						const value = (object as any)[column!.key!];
						return new CollectionToken([
							new StringToken(column!.name!),
							new StringToken(`=`),
							value instanceof Keyword
								? new StringToken(value.toString())
								: new ParameterToken(value),
						]);
					}),
			),
		);
		return this;
	}

	having(tokenable: Tokenable) {
		this.append `HAVING`;

		// TODO: should we add a separator here as well?
		this.tokens.push(...tokenable.toTokens());
		return this;
	}

	orderBy(...tokenables: Tokenable[]) {
		this.tokens.push(
			new StringToken(`ORDER BY`),
			new SeparatorToken(`,`, tokenables.map(tokenable => new CollectionToken(tokenable.toTokens()))),
		);
		return this;
	}

	groupBy(...columnNames: (keyof Row | Column<any>)[]) {
		this.tokens.push(
			new StringToken(`GROUP BY`),
			new SeparatorToken(`,`, columnNames
				.map((columnName: any): Column<any> | undefined => typeof columnName === 'string'
					? this.getColumn(columnName)
					: columnName)
				.filter(column => Boolean(column))
				.map(column => new CollectionToken(column!.toTokens())),
			),
		);
		return this;
	}

	returning<
		A extends keyof Row,
		R = (
			{ [PA in A]: Row[PA]; }
		)
	>(
		columnNameA: A,
	): Query<T, Row, InsertRow, UpdateRow, R[], R>;
	returning<
		A extends keyof Row,
		B extends keyof Row
	>(
		columnNameA: A,
		columnNameB: B,
	): Query<T, Row, InsertRow, UpdateRow, (
		{ [PA in A]: Row[PA]; } &
		{ [PB in B]: Row[PB]; }
	)[]>;
	returning<
		A extends keyof Row,
		B extends keyof Row,
		C extends keyof Row
	>(
		columnNameA: A,
		columnNameB: B,
		columnNameC: C,
	): Query<T, Row, InsertRow, UpdateRow, (
		{ [PA in A]: Row[PA]; } &
		{ [PB in B]: Row[PB]; } &
		{ [PC in C]: Row[PC]; }
	)[]>;
	returning<
		A extends keyof Row,
		B extends keyof Row,
		C extends keyof Row,
		D extends keyof Row
	>(
		columnNameA: A,
		columnNameB: B,
		columnNameC: C,
		columnNameD: D,
	): Query<T, Row, InsertRow, UpdateRow, (
		{ [PA in A]: Row[PA]; } &
		{ [PB in B]: Row[PB]; } &
		{ [PC in C]: Row[PC]; } &
		{ [PD in D]: Row[PD]; }
	)[]>;
	returning<
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
	): Query<T, Row, InsertRow, UpdateRow, (
		{ [PA in A]: Row[PA]; } &
		{ [PB in B]: Row[PB]; } &
		{ [PC in C]: Row[PC]; } &
		{ [PD in D]: Row[PD]; } &
		{ [PE in E]: Row[PE]; }
	)[]>;
	returning<
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
	): Query<T, Row, InsertRow, UpdateRow, (
		{ [PA in A]: Row[PA]; } &
		{ [PB in B]: Row[PB]; } &
		{ [PC in C]: Row[PC]; } &
		{ [PD in D]: Row[PD]; } &
		{ [PE in E]: Row[PE]; } &
		{ [PF in F]: Row[PF]; }
	)[]>;
	returning<
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
	): Query<T, Row, InsertRow, UpdateRow, (
		{ [PA in A]: Row[PA]; } &
		{ [PB in B]: Row[PB]; } &
		{ [PC in C]: Row[PC]; } &
		{ [PD in D]: Row[PD]; } &
		{ [PE in E]: Row[PE]; } &
		{ [PF in F]: Row[PF]; } &
		{ [PG in G]: Row[PG]; }
	)[]>;
	returning<
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
	): Query<T, Row, InsertRow, UpdateRow, (
		{ [PA in A]: Row[PA]; } &
		{ [PB in B]: Row[PB]; } &
		{ [PC in C]: Row[PC]; } &
		{ [PD in D]: Row[PD]; } &
		{ [PE in E]: Row[PE]; } &
		{ [PF in F]: Row[PF]; } &
		{ [PG in G]: Row[PG]; } &
		{ [PH in H]: Row[PH]; }
	)[]>;
	returning<
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
	): Query<T, Row, InsertRow, UpdateRow, any, any> {
		this.type = 'ROWS';
		this.tokens.push(
			new StringToken(`RETURNING`),
			new SeparatorToken(`,`, [
					columnNameA,
					columnNameB,
					columnNameC,
					columnNameD,
					columnNameE,
					columnNameF,
					columnNameG,
					columnNameH,
				]
				.filter(columnName => columnName)
				.map(columnName => {
					const column = this.table.getColumn(columnName!);
					return new StringToken(`${this.table.getName()}.${column!.name!} AS "${column!.key}"`);
				})
			),
		);
		return this;
	}
};

export class PartialQuery implements Tokenable {
	tokens: Token[] = [];

	constructor(...tokens: Token[]) {
		this.tokens = tokens || [];
	}

	toTokens() {
		return this.tokens;
	}

	add(partialQuery: PartialQuery, separator: string) {
		this.tokens.push(
			new StringToken(separator),
			...partialQuery.tokens,
		);
		return this;
	}

	or(partialQuery: PartialQuery) {
		return this.add(partialQuery, `OR`);
	}

	and(partialQuery: PartialQuery) {
		return this.add(partialQuery, `AND`);
	}

	minus(string: string) {
		this.tokens.push(
			new StringToken(`-`),
			new ParameterToken(string),
		);
		return this;
	}

	plus(string: string) {
		this.tokens.push(
			new StringToken(`+`),
			new ParameterToken(string),
		);
		return this;
	}

	in(object: any[] | PartialQuery | Query<any, any, any, any>) {
		if (object instanceof PartialQuery) {
			this.tokens.push(
				new StringToken(`IN`),
				new GroupToken(object.tokens),
			);
		}
		else if (object instanceof Query) {
			this.tokens.push(
				new StringToken(`IN`),
				new GroupToken(object.tokens),
			);
		}
		else {
			this.tokens.push(
				new StringToken(`IN`),
				new GroupToken([
					new ParameterToken(object),
				]),
			);
		}
		return this;
	}

	// TODO: Move this to an order by query.
	nullsFirst() {
		this.tokens.push(new StringToken(`NULLS FIRST`));
		return this;
	}

	nullsLast() {
		this.tokens.push(new StringToken(`NULLS LAST`));
		return this;
	}
}

export class SelectQuery<T extends TableWrapper<Row, InsertRow, UpdateRow>, Row, InsertRow, UpdateRow, Ret = void> extends Query<T, Row, InsertRow, UpdateRow, Ret> {
	//
}
