import type { Column } from './column';
import { DeleteQuery } from './delete';
import type { Expression } from './expression';
import { GetDataType } from './types';
import { InsertQuery } from './insert';
import { Query } from './query';
import { SelectQuery } from './select';
import { UpdateQuery } from './update';

export type ResultSetDataType<Type, IsNotNull extends boolean> = IsNotNull extends true ? Type : Type | null;

// This is not ideal, but the `ShouldCapture` flag can be used to map returning types to a a helper class that can
// capture the nullability of the result and the data type separately.  This is used in the `FromItemQuery` type
// to extract the correct nullability and data type on each key given a query.
type MaybeCapturingResultSetDataType<Type, IsNotNull extends boolean, ShouldCapture extends boolean> = ShouldCapture extends true
    ? GetDataType<Type, IsNotNull>
    : ResultSetDataType<Type, IsNotNull>;

type ReturningResultSet<Returning, Test extends boolean> = {
    [K in keyof Returning]: Returning[K] extends Column<
        any,
        any,
        infer D,
        infer N,
        any,
        infer JoinType
    >
        ? Extract<JoinType, 'left-join'> extends never
            ? Extract<JoinType, 'left-side-of-right-join'> extends never
                ? Extract<JoinType, 'full-join'> extends never
                    ? N extends true
                        ? MaybeCapturingResultSetDataType<D, true, Test>
                        : MaybeCapturingResultSetDataType<D, false, Test>
                    : MaybeCapturingResultSetDataType<D, false, Test>
                : MaybeCapturingResultSetDataType<D, false, Test>
            : MaybeCapturingResultSetDataType<D, false, Test>
        : Returning[K] extends Expression<infer D, infer IsNotNull, any>
            ? MaybeCapturingResultSetDataType<D, IsNotNull, Test>
            : Returning[K] extends Query<{}>
                ? MaybeCapturingResultSet<Returning[K], Test>[keyof MaybeCapturingResultSet<Returning[K], Test>]
                : never;
};

type MaybeCapturingResultSet<T extends Query<any>, Test extends boolean> =
    T extends SelectQuery<infer Returning>
        ? ReturningResultSet<Returning, Test>
        : T extends DeleteQuery<any, infer Returning>
            ? ReturningResultSet<Returning, Test>
            : T extends UpdateQuery<any, infer Returning>
                ? ReturningResultSet<Returning, Test>
                : T extends InsertQuery<any, infer Returning>
                    ? ReturningResultSet<Returning, Test>
                    : never;

export type CapturingResultSet<T extends Query<any>> = MaybeCapturingResultSet<T, true>;
export type ResultSet<T extends Query<any>> = MaybeCapturingResultSet<T, false>;
