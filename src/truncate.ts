import {QueryExecutorFn} from "./types";
import {Table, TableDefinition} from "./table";
import {StringToken, Token} from "./tokens";
import {Query} from "./query";

export const makeTruncate = (queryExecutor: QueryExecutorFn) =>
    <T extends Table<any, any>>(table: T,): T extends TableDefinition<any> ? never : TruncateQuery<T> => {
        return new TruncateQuery<T>(
            queryExecutor,
            table,
            [
                new StringToken(`TRUNCATE`),
                new StringToken((table as Table<any, any>).getName()),
            ]) as any;
    };

export class TruncateQuery<T extends Table<any, any>> extends Query<void> {
    constructor(
        private readonly queryExecutor: QueryExecutorFn,
        private readonly table: T,
        private readonly tokens: Token[],
    ) {
        super();
    }

    restartIdentity<T extends Table<any, any>>() {
        return this.newTruncateQuery([
            ...this.tokens,
            new StringToken(`RESTART IDENTITY`)
        ]) as any;
    }

    cascade<T extends Table<any, any>>() {
        return this.newTruncateQuery([
            ...this.tokens,
            new StringToken("CASCADE")
        ])
    }

    private newTruncateQuery(tokens: Token[]): TruncateQuery<any> {
        return new TruncateQuery(this.queryExecutor, this.table, tokens);
    }

    getReturningKeys(): string[] {
        return [];
    }

    toTokens(): Token[] {
        return this.tokens;
    }
}
