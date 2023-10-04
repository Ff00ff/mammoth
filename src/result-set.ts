import type { Column } from './column';
import { DeleteQuery } from './delete';
import type { Expression } from './expression';
import { Expand, GetDataType } from './types';
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

type MaybeCapturingReturningResultSet<Returning, ShouldCapture extends boolean> = {
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
                        ? MaybeCapturingResultSetDataType<D, true, ShouldCapture>
                        : MaybeCapturingResultSetDataType<D, false, ShouldCapture>
                    : MaybeCapturingResultSetDataType<D, false, ShouldCapture>
                : MaybeCapturingResultSetDataType<D, false, ShouldCapture>
            : MaybeCapturingResultSetDataType<D, false, ShouldCapture>
        : Returning[K] extends Expression<infer D, infer IsNotNull, any>
            ? MaybeCapturingResultSetDataType<D, IsNotNull, ShouldCapture>
            : Returning[K] extends Query<{}>
                ? MaybeCapturingResultSet<Returning[K], ShouldCapture>[keyof MaybeCapturingResultSet<Returning[K], ShouldCapture>]
                : never;
};

type MaybeCapturingResultSet<T extends Query<any>, ShouldCapture extends boolean> =
    T extends SelectQuery<infer Returning>
        ? MaybeCapturingReturningResultSet<Returning, ShouldCapture>
        : T extends DeleteQuery<any, infer Returning>
            ? MaybeCapturingReturningResultSet<Returning, ShouldCapture>
            : T extends UpdateQuery<any, infer Returning>
                ? MaybeCapturingReturningResultSet<Returning, ShouldCapture>
                : T extends InsertQuery<any, infer Returning>
                    ? MaybeCapturingReturningResultSet<Returning, ShouldCapture>
                    : never;

export type CapturingResultSet<T extends Query<any>> = Expand<MaybeCapturingResultSet<T, true>>;
export type ResultSet<T extends Query<any>> = Expand<MaybeCapturingResultSet<T, false>>;
