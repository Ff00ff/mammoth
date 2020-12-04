import { Column, ColumnSet } from './column';

import { Expression } from './expression';
import { SelectQuery } from './select';
import { Star } from './sql-functions';

export type GetSelectableName<S> = S extends Column<infer A2, string, any, boolean, boolean, any>
  ? A2
  : S extends Expression<any, boolean, infer A1>
  ? A1
  : S extends SelectQuery<infer Columns>
  ? keyof Columns // This only works if the query has one select clause
  : never;

export type GetSelectable<C extends Selectable> = C extends ColumnSet<infer Columns>
  ? Columns
  : { [K in GetSelectableName<C>]: C };

export type Selectable =
  | Expression<any, any, any>
  | SelectQuery<any>
  | Column<any, any, any, boolean, boolean, any>
  | ColumnSet<any>
  | Star;

type ContainsStar<Selectables> = Extract<Star, Selectables> extends never ? false : true;

export interface SelectFn {
  <C1 extends Selectable>(c1: C1): SelectQuery<GetSelectable<C1>, ContainsStar<C1>>;
  <C1 extends Selectable, C2 extends Selectable>(c1: C1, c2: C2): SelectQuery<
    GetSelectable<C1> & GetSelectable<C2>,
    ContainsStar<C1 | C2>
  >;
  <C1 extends Selectable, C2 extends Selectable, C3 extends Selectable>(
    c1: C1,
    c2: C2,
    c3: C3,
  ): SelectQuery<
    GetSelectable<C1> & GetSelectable<C2> & GetSelectable<C3>,
    ContainsStar<C1 | C2 | C3>
  >;
  <C1 extends Selectable, C2 extends Selectable, C3 extends Selectable, C4 extends Selectable>(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
  ): SelectQuery<
    GetSelectable<C1> & GetSelectable<C2> & GetSelectable<C3> & GetSelectable<C4>,
    ContainsStar<C1 | C2 | C3 | C4>
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5>,
    ContainsStar<C1 | C2 | C3 | C4 | C5>
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6>,
    ContainsStar<C1 | C2 | C3 | C4 | C5 | C6>
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7>,
    ContainsStar<C1 | C2 | C3 | C4 | C5 | C6 | C7>
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8>,
    ContainsStar<C1 | C2 | C3 | C4 | C5 | C6 | C7 | C8>
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9>,
    ContainsStar<C1 | C2 | C3 | C4 | C5 | C6 | C7 | C8 | C9>
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10>,
    ContainsStar<C1 | C2 | C3 | C4 | C5 | C6 | C7 | C8 | C9 | C10>
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11>,
    ContainsStar<C1 | C2 | C3 | C4 | C5 | C6 | C7 | C8 | C9 | C10 | C11>
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12>,
    ContainsStar<C1 | C2 | C3 | C4 | C5 | C6 | C7 | C8 | C9 | C10 | C11 | C12>
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13>,
    ContainsStar<C1 | C2 | C3 | C4 | C5 | C6 | C7 | C8 | C9 | C10 | C11 | C12 | C13>
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14>,
    ContainsStar<C1 | C2 | C3 | C4 | C5 | C6 | C7 | C8 | C9 | C10 | C11 | C12 | C13 | C14>
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15>,
    ContainsStar<C1 | C2 | C3 | C4 | C5 | C6 | C7 | C8 | C9 | C10 | C11 | C12 | C13 | C14 | C15>
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16>,
    ContainsStar<
      C1 | C2 | C3 | C4 | C5 | C6 | C7 | C8 | C9 | C10 | C11 | C12 | C13 | C14 | C15 | C16
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17>,
    ContainsStar<
      C1 | C2 | C3 | C4 | C5 | C6 | C7 | C8 | C9 | C10 | C11 | C12 | C13 | C14 | C15 | C16 | C17
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable,
    C38 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
    c38: C38,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37> &
      GetSelectable<C38>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
      | C38
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable,
    C38 extends Selectable,
    C39 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
    c38: C38,
    c39: C39,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37> &
      GetSelectable<C38> &
      GetSelectable<C39>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
      | C38
      | C39
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable,
    C38 extends Selectable,
    C39 extends Selectable,
    C40 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
    c38: C38,
    c39: C39,
    c40: C40,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37> &
      GetSelectable<C38> &
      GetSelectable<C39> &
      GetSelectable<C40>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
      | C38
      | C39
      | C40
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable,
    C38 extends Selectable,
    C39 extends Selectable,
    C40 extends Selectable,
    C41 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
    c38: C38,
    c39: C39,
    c40: C40,
    c41: C41,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37> &
      GetSelectable<C38> &
      GetSelectable<C39> &
      GetSelectable<C40> &
      GetSelectable<C41>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
      | C38
      | C39
      | C40
      | C41
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable,
    C38 extends Selectable,
    C39 extends Selectable,
    C40 extends Selectable,
    C41 extends Selectable,
    C42 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
    c38: C38,
    c39: C39,
    c40: C40,
    c41: C41,
    c42: C42,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37> &
      GetSelectable<C38> &
      GetSelectable<C39> &
      GetSelectable<C40> &
      GetSelectable<C41> &
      GetSelectable<C42>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
      | C38
      | C39
      | C40
      | C41
      | C42
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable,
    C38 extends Selectable,
    C39 extends Selectable,
    C40 extends Selectable,
    C41 extends Selectable,
    C42 extends Selectable,
    C43 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
    c38: C38,
    c39: C39,
    c40: C40,
    c41: C41,
    c42: C42,
    c43: C43,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37> &
      GetSelectable<C38> &
      GetSelectable<C39> &
      GetSelectable<C40> &
      GetSelectable<C41> &
      GetSelectable<C42> &
      GetSelectable<C43>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
      | C38
      | C39
      | C40
      | C41
      | C42
      | C43
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable,
    C38 extends Selectable,
    C39 extends Selectable,
    C40 extends Selectable,
    C41 extends Selectable,
    C42 extends Selectable,
    C43 extends Selectable,
    C44 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
    c38: C38,
    c39: C39,
    c40: C40,
    c41: C41,
    c42: C42,
    c43: C43,
    c44: C44,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37> &
      GetSelectable<C38> &
      GetSelectable<C39> &
      GetSelectable<C40> &
      GetSelectable<C41> &
      GetSelectable<C42> &
      GetSelectable<C43> &
      GetSelectable<C44>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
      | C38
      | C39
      | C40
      | C41
      | C42
      | C43
      | C44
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable,
    C38 extends Selectable,
    C39 extends Selectable,
    C40 extends Selectable,
    C41 extends Selectable,
    C42 extends Selectable,
    C43 extends Selectable,
    C44 extends Selectable,
    C45 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
    c38: C38,
    c39: C39,
    c40: C40,
    c41: C41,
    c42: C42,
    c43: C43,
    c44: C44,
    c45: C45,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37> &
      GetSelectable<C38> &
      GetSelectable<C39> &
      GetSelectable<C40> &
      GetSelectable<C41> &
      GetSelectable<C42> &
      GetSelectable<C43> &
      GetSelectable<C44> &
      GetSelectable<C45>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
      | C38
      | C39
      | C40
      | C41
      | C42
      | C43
      | C44
      | C45
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable,
    C38 extends Selectable,
    C39 extends Selectable,
    C40 extends Selectable,
    C41 extends Selectable,
    C42 extends Selectable,
    C43 extends Selectable,
    C44 extends Selectable,
    C45 extends Selectable,
    C46 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
    c38: C38,
    c39: C39,
    c40: C40,
    c41: C41,
    c42: C42,
    c43: C43,
    c44: C44,
    c45: C45,
    c46: C46,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37> &
      GetSelectable<C38> &
      GetSelectable<C39> &
      GetSelectable<C40> &
      GetSelectable<C41> &
      GetSelectable<C42> &
      GetSelectable<C43> &
      GetSelectable<C44> &
      GetSelectable<C45> &
      GetSelectable<C46>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
      | C38
      | C39
      | C40
      | C41
      | C42
      | C43
      | C44
      | C45
      | C46
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable,
    C38 extends Selectable,
    C39 extends Selectable,
    C40 extends Selectable,
    C41 extends Selectable,
    C42 extends Selectable,
    C43 extends Selectable,
    C44 extends Selectable,
    C45 extends Selectable,
    C46 extends Selectable,
    C47 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
    c38: C38,
    c39: C39,
    c40: C40,
    c41: C41,
    c42: C42,
    c43: C43,
    c44: C44,
    c45: C45,
    c46: C46,
    c47: C47,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37> &
      GetSelectable<C38> &
      GetSelectable<C39> &
      GetSelectable<C40> &
      GetSelectable<C41> &
      GetSelectable<C42> &
      GetSelectable<C43> &
      GetSelectable<C44> &
      GetSelectable<C45> &
      GetSelectable<C46> &
      GetSelectable<C47>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
      | C38
      | C39
      | C40
      | C41
      | C42
      | C43
      | C44
      | C45
      | C46
      | C47
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable,
    C38 extends Selectable,
    C39 extends Selectable,
    C40 extends Selectable,
    C41 extends Selectable,
    C42 extends Selectable,
    C43 extends Selectable,
    C44 extends Selectable,
    C45 extends Selectable,
    C46 extends Selectable,
    C47 extends Selectable,
    C48 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
    c38: C38,
    c39: C39,
    c40: C40,
    c41: C41,
    c42: C42,
    c43: C43,
    c44: C44,
    c45: C45,
    c46: C46,
    c47: C47,
    c48: C48,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37> &
      GetSelectable<C38> &
      GetSelectable<C39> &
      GetSelectable<C40> &
      GetSelectable<C41> &
      GetSelectable<C42> &
      GetSelectable<C43> &
      GetSelectable<C44> &
      GetSelectable<C45> &
      GetSelectable<C46> &
      GetSelectable<C47> &
      GetSelectable<C48>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
      | C38
      | C39
      | C40
      | C41
      | C42
      | C43
      | C44
      | C45
      | C46
      | C47
      | C48
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable,
    C38 extends Selectable,
    C39 extends Selectable,
    C40 extends Selectable,
    C41 extends Selectable,
    C42 extends Selectable,
    C43 extends Selectable,
    C44 extends Selectable,
    C45 extends Selectable,
    C46 extends Selectable,
    C47 extends Selectable,
    C48 extends Selectable,
    C49 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
    c38: C38,
    c39: C39,
    c40: C40,
    c41: C41,
    c42: C42,
    c43: C43,
    c44: C44,
    c45: C45,
    c46: C46,
    c47: C47,
    c48: C48,
    c49: C49,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37> &
      GetSelectable<C38> &
      GetSelectable<C39> &
      GetSelectable<C40> &
      GetSelectable<C41> &
      GetSelectable<C42> &
      GetSelectable<C43> &
      GetSelectable<C44> &
      GetSelectable<C45> &
      GetSelectable<C46> &
      GetSelectable<C47> &
      GetSelectable<C48> &
      GetSelectable<C49>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
      | C38
      | C39
      | C40
      | C41
      | C42
      | C43
      | C44
      | C45
      | C46
      | C47
      | C48
      | C49
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable,
    C38 extends Selectable,
    C39 extends Selectable,
    C40 extends Selectable,
    C41 extends Selectable,
    C42 extends Selectable,
    C43 extends Selectable,
    C44 extends Selectable,
    C45 extends Selectable,
    C46 extends Selectable,
    C47 extends Selectable,
    C48 extends Selectable,
    C49 extends Selectable,
    C50 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
    c38: C38,
    c39: C39,
    c40: C40,
    c41: C41,
    c42: C42,
    c43: C43,
    c44: C44,
    c45: C45,
    c46: C46,
    c47: C47,
    c48: C48,
    c49: C49,
    c50: C50,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37> &
      GetSelectable<C38> &
      GetSelectable<C39> &
      GetSelectable<C40> &
      GetSelectable<C41> &
      GetSelectable<C42> &
      GetSelectable<C43> &
      GetSelectable<C44> &
      GetSelectable<C45> &
      GetSelectable<C46> &
      GetSelectable<C47> &
      GetSelectable<C48> &
      GetSelectable<C49> &
      GetSelectable<C50>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
      | C38
      | C39
      | C40
      | C41
      | C42
      | C43
      | C44
      | C45
      | C46
      | C47
      | C48
      | C49
      | C50
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable,
    C38 extends Selectable,
    C39 extends Selectable,
    C40 extends Selectable,
    C41 extends Selectable,
    C42 extends Selectable,
    C43 extends Selectable,
    C44 extends Selectable,
    C45 extends Selectable,
    C46 extends Selectable,
    C47 extends Selectable,
    C48 extends Selectable,
    C49 extends Selectable,
    C50 extends Selectable,
    C51 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
    c38: C38,
    c39: C39,
    c40: C40,
    c41: C41,
    c42: C42,
    c43: C43,
    c44: C44,
    c45: C45,
    c46: C46,
    c47: C47,
    c48: C48,
    c49: C49,
    c50: C50,
    c51: C51,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37> &
      GetSelectable<C38> &
      GetSelectable<C39> &
      GetSelectable<C40> &
      GetSelectable<C41> &
      GetSelectable<C42> &
      GetSelectable<C43> &
      GetSelectable<C44> &
      GetSelectable<C45> &
      GetSelectable<C46> &
      GetSelectable<C47> &
      GetSelectable<C48> &
      GetSelectable<C49> &
      GetSelectable<C50> &
      GetSelectable<C51>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
      | C38
      | C39
      | C40
      | C41
      | C42
      | C43
      | C44
      | C45
      | C46
      | C47
      | C48
      | C49
      | C50
      | C51
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable,
    C38 extends Selectable,
    C39 extends Selectable,
    C40 extends Selectable,
    C41 extends Selectable,
    C42 extends Selectable,
    C43 extends Selectable,
    C44 extends Selectable,
    C45 extends Selectable,
    C46 extends Selectable,
    C47 extends Selectable,
    C48 extends Selectable,
    C49 extends Selectable,
    C50 extends Selectable,
    C51 extends Selectable,
    C52 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
    c38: C38,
    c39: C39,
    c40: C40,
    c41: C41,
    c42: C42,
    c43: C43,
    c44: C44,
    c45: C45,
    c46: C46,
    c47: C47,
    c48: C48,
    c49: C49,
    c50: C50,
    c51: C51,
    c52: C52,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37> &
      GetSelectable<C38> &
      GetSelectable<C39> &
      GetSelectable<C40> &
      GetSelectable<C41> &
      GetSelectable<C42> &
      GetSelectable<C43> &
      GetSelectable<C44> &
      GetSelectable<C45> &
      GetSelectable<C46> &
      GetSelectable<C47> &
      GetSelectable<C48> &
      GetSelectable<C49> &
      GetSelectable<C50> &
      GetSelectable<C51> &
      GetSelectable<C52>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
      | C38
      | C39
      | C40
      | C41
      | C42
      | C43
      | C44
      | C45
      | C46
      | C47
      | C48
      | C49
      | C50
      | C51
      | C52
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable,
    C38 extends Selectable,
    C39 extends Selectable,
    C40 extends Selectable,
    C41 extends Selectable,
    C42 extends Selectable,
    C43 extends Selectable,
    C44 extends Selectable,
    C45 extends Selectable,
    C46 extends Selectable,
    C47 extends Selectable,
    C48 extends Selectable,
    C49 extends Selectable,
    C50 extends Selectable,
    C51 extends Selectable,
    C52 extends Selectable,
    C53 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
    c38: C38,
    c39: C39,
    c40: C40,
    c41: C41,
    c42: C42,
    c43: C43,
    c44: C44,
    c45: C45,
    c46: C46,
    c47: C47,
    c48: C48,
    c49: C49,
    c50: C50,
    c51: C51,
    c52: C52,
    c53: C53,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37> &
      GetSelectable<C38> &
      GetSelectable<C39> &
      GetSelectable<C40> &
      GetSelectable<C41> &
      GetSelectable<C42> &
      GetSelectable<C43> &
      GetSelectable<C44> &
      GetSelectable<C45> &
      GetSelectable<C46> &
      GetSelectable<C47> &
      GetSelectable<C48> &
      GetSelectable<C49> &
      GetSelectable<C50> &
      GetSelectable<C51> &
      GetSelectable<C52> &
      GetSelectable<C53>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
      | C38
      | C39
      | C40
      | C41
      | C42
      | C43
      | C44
      | C45
      | C46
      | C47
      | C48
      | C49
      | C50
      | C51
      | C52
      | C53
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable,
    C38 extends Selectable,
    C39 extends Selectable,
    C40 extends Selectable,
    C41 extends Selectable,
    C42 extends Selectable,
    C43 extends Selectable,
    C44 extends Selectable,
    C45 extends Selectable,
    C46 extends Selectable,
    C47 extends Selectable,
    C48 extends Selectable,
    C49 extends Selectable,
    C50 extends Selectable,
    C51 extends Selectable,
    C52 extends Selectable,
    C53 extends Selectable,
    C54 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
    c38: C38,
    c39: C39,
    c40: C40,
    c41: C41,
    c42: C42,
    c43: C43,
    c44: C44,
    c45: C45,
    c46: C46,
    c47: C47,
    c48: C48,
    c49: C49,
    c50: C50,
    c51: C51,
    c52: C52,
    c53: C53,
    c54: C54,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37> &
      GetSelectable<C38> &
      GetSelectable<C39> &
      GetSelectable<C40> &
      GetSelectable<C41> &
      GetSelectable<C42> &
      GetSelectable<C43> &
      GetSelectable<C44> &
      GetSelectable<C45> &
      GetSelectable<C46> &
      GetSelectable<C47> &
      GetSelectable<C48> &
      GetSelectable<C49> &
      GetSelectable<C50> &
      GetSelectable<C51> &
      GetSelectable<C52> &
      GetSelectable<C53> &
      GetSelectable<C54>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
      | C38
      | C39
      | C40
      | C41
      | C42
      | C43
      | C44
      | C45
      | C46
      | C47
      | C48
      | C49
      | C50
      | C51
      | C52
      | C53
      | C54
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable,
    C38 extends Selectable,
    C39 extends Selectable,
    C40 extends Selectable,
    C41 extends Selectable,
    C42 extends Selectable,
    C43 extends Selectable,
    C44 extends Selectable,
    C45 extends Selectable,
    C46 extends Selectable,
    C47 extends Selectable,
    C48 extends Selectable,
    C49 extends Selectable,
    C50 extends Selectable,
    C51 extends Selectable,
    C52 extends Selectable,
    C53 extends Selectable,
    C54 extends Selectable,
    C55 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
    c38: C38,
    c39: C39,
    c40: C40,
    c41: C41,
    c42: C42,
    c43: C43,
    c44: C44,
    c45: C45,
    c46: C46,
    c47: C47,
    c48: C48,
    c49: C49,
    c50: C50,
    c51: C51,
    c52: C52,
    c53: C53,
    c54: C54,
    c55: C55,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37> &
      GetSelectable<C38> &
      GetSelectable<C39> &
      GetSelectable<C40> &
      GetSelectable<C41> &
      GetSelectable<C42> &
      GetSelectable<C43> &
      GetSelectable<C44> &
      GetSelectable<C45> &
      GetSelectable<C46> &
      GetSelectable<C47> &
      GetSelectable<C48> &
      GetSelectable<C49> &
      GetSelectable<C50> &
      GetSelectable<C51> &
      GetSelectable<C52> &
      GetSelectable<C53> &
      GetSelectable<C54> &
      GetSelectable<C55>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
      | C38
      | C39
      | C40
      | C41
      | C42
      | C43
      | C44
      | C45
      | C46
      | C47
      | C48
      | C49
      | C50
      | C51
      | C52
      | C53
      | C54
      | C55
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable,
    C38 extends Selectable,
    C39 extends Selectable,
    C40 extends Selectable,
    C41 extends Selectable,
    C42 extends Selectable,
    C43 extends Selectable,
    C44 extends Selectable,
    C45 extends Selectable,
    C46 extends Selectable,
    C47 extends Selectable,
    C48 extends Selectable,
    C49 extends Selectable,
    C50 extends Selectable,
    C51 extends Selectable,
    C52 extends Selectable,
    C53 extends Selectable,
    C54 extends Selectable,
    C55 extends Selectable,
    C56 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
    c38: C38,
    c39: C39,
    c40: C40,
    c41: C41,
    c42: C42,
    c43: C43,
    c44: C44,
    c45: C45,
    c46: C46,
    c47: C47,
    c48: C48,
    c49: C49,
    c50: C50,
    c51: C51,
    c52: C52,
    c53: C53,
    c54: C54,
    c55: C55,
    c56: C56,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37> &
      GetSelectable<C38> &
      GetSelectable<C39> &
      GetSelectable<C40> &
      GetSelectable<C41> &
      GetSelectable<C42> &
      GetSelectable<C43> &
      GetSelectable<C44> &
      GetSelectable<C45> &
      GetSelectable<C46> &
      GetSelectable<C47> &
      GetSelectable<C48> &
      GetSelectable<C49> &
      GetSelectable<C50> &
      GetSelectable<C51> &
      GetSelectable<C52> &
      GetSelectable<C53> &
      GetSelectable<C54> &
      GetSelectable<C55> &
      GetSelectable<C56>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
      | C38
      | C39
      | C40
      | C41
      | C42
      | C43
      | C44
      | C45
      | C46
      | C47
      | C48
      | C49
      | C50
      | C51
      | C52
      | C53
      | C54
      | C55
      | C56
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable,
    C38 extends Selectable,
    C39 extends Selectable,
    C40 extends Selectable,
    C41 extends Selectable,
    C42 extends Selectable,
    C43 extends Selectable,
    C44 extends Selectable,
    C45 extends Selectable,
    C46 extends Selectable,
    C47 extends Selectable,
    C48 extends Selectable,
    C49 extends Selectable,
    C50 extends Selectable,
    C51 extends Selectable,
    C52 extends Selectable,
    C53 extends Selectable,
    C54 extends Selectable,
    C55 extends Selectable,
    C56 extends Selectable,
    C57 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
    c38: C38,
    c39: C39,
    c40: C40,
    c41: C41,
    c42: C42,
    c43: C43,
    c44: C44,
    c45: C45,
    c46: C46,
    c47: C47,
    c48: C48,
    c49: C49,
    c50: C50,
    c51: C51,
    c52: C52,
    c53: C53,
    c54: C54,
    c55: C55,
    c56: C56,
    c57: C57,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37> &
      GetSelectable<C38> &
      GetSelectable<C39> &
      GetSelectable<C40> &
      GetSelectable<C41> &
      GetSelectable<C42> &
      GetSelectable<C43> &
      GetSelectable<C44> &
      GetSelectable<C45> &
      GetSelectable<C46> &
      GetSelectable<C47> &
      GetSelectable<C48> &
      GetSelectable<C49> &
      GetSelectable<C50> &
      GetSelectable<C51> &
      GetSelectable<C52> &
      GetSelectable<C53> &
      GetSelectable<C54> &
      GetSelectable<C55> &
      GetSelectable<C56> &
      GetSelectable<C57>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
      | C38
      | C39
      | C40
      | C41
      | C42
      | C43
      | C44
      | C45
      | C46
      | C47
      | C48
      | C49
      | C50
      | C51
      | C52
      | C53
      | C54
      | C55
      | C56
      | C57
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable,
    C38 extends Selectable,
    C39 extends Selectable,
    C40 extends Selectable,
    C41 extends Selectable,
    C42 extends Selectable,
    C43 extends Selectable,
    C44 extends Selectable,
    C45 extends Selectable,
    C46 extends Selectable,
    C47 extends Selectable,
    C48 extends Selectable,
    C49 extends Selectable,
    C50 extends Selectable,
    C51 extends Selectable,
    C52 extends Selectable,
    C53 extends Selectable,
    C54 extends Selectable,
    C55 extends Selectable,
    C56 extends Selectable,
    C57 extends Selectable,
    C58 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
    c38: C38,
    c39: C39,
    c40: C40,
    c41: C41,
    c42: C42,
    c43: C43,
    c44: C44,
    c45: C45,
    c46: C46,
    c47: C47,
    c48: C48,
    c49: C49,
    c50: C50,
    c51: C51,
    c52: C52,
    c53: C53,
    c54: C54,
    c55: C55,
    c56: C56,
    c57: C57,
    c58: C58,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37> &
      GetSelectable<C38> &
      GetSelectable<C39> &
      GetSelectable<C40> &
      GetSelectable<C41> &
      GetSelectable<C42> &
      GetSelectable<C43> &
      GetSelectable<C44> &
      GetSelectable<C45> &
      GetSelectable<C46> &
      GetSelectable<C47> &
      GetSelectable<C48> &
      GetSelectable<C49> &
      GetSelectable<C50> &
      GetSelectable<C51> &
      GetSelectable<C52> &
      GetSelectable<C53> &
      GetSelectable<C54> &
      GetSelectable<C55> &
      GetSelectable<C56> &
      GetSelectable<C57> &
      GetSelectable<C58>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
      | C38
      | C39
      | C40
      | C41
      | C42
      | C43
      | C44
      | C45
      | C46
      | C47
      | C48
      | C49
      | C50
      | C51
      | C52
      | C53
      | C54
      | C55
      | C56
      | C57
      | C58
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable,
    C38 extends Selectable,
    C39 extends Selectable,
    C40 extends Selectable,
    C41 extends Selectable,
    C42 extends Selectable,
    C43 extends Selectable,
    C44 extends Selectable,
    C45 extends Selectable,
    C46 extends Selectable,
    C47 extends Selectable,
    C48 extends Selectable,
    C49 extends Selectable,
    C50 extends Selectable,
    C51 extends Selectable,
    C52 extends Selectable,
    C53 extends Selectable,
    C54 extends Selectable,
    C55 extends Selectable,
    C56 extends Selectable,
    C57 extends Selectable,
    C58 extends Selectable,
    C59 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
    c38: C38,
    c39: C39,
    c40: C40,
    c41: C41,
    c42: C42,
    c43: C43,
    c44: C44,
    c45: C45,
    c46: C46,
    c47: C47,
    c48: C48,
    c49: C49,
    c50: C50,
    c51: C51,
    c52: C52,
    c53: C53,
    c54: C54,
    c55: C55,
    c56: C56,
    c57: C57,
    c58: C58,
    c59: C59,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37> &
      GetSelectable<C38> &
      GetSelectable<C39> &
      GetSelectable<C40> &
      GetSelectable<C41> &
      GetSelectable<C42> &
      GetSelectable<C43> &
      GetSelectable<C44> &
      GetSelectable<C45> &
      GetSelectable<C46> &
      GetSelectable<C47> &
      GetSelectable<C48> &
      GetSelectable<C49> &
      GetSelectable<C50> &
      GetSelectable<C51> &
      GetSelectable<C52> &
      GetSelectable<C53> &
      GetSelectable<C54> &
      GetSelectable<C55> &
      GetSelectable<C56> &
      GetSelectable<C57> &
      GetSelectable<C58> &
      GetSelectable<C59>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
      | C38
      | C39
      | C40
      | C41
      | C42
      | C43
      | C44
      | C45
      | C46
      | C47
      | C48
      | C49
      | C50
      | C51
      | C52
      | C53
      | C54
      | C55
      | C56
      | C57
      | C58
      | C59
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable,
    C38 extends Selectable,
    C39 extends Selectable,
    C40 extends Selectable,
    C41 extends Selectable,
    C42 extends Selectable,
    C43 extends Selectable,
    C44 extends Selectable,
    C45 extends Selectable,
    C46 extends Selectable,
    C47 extends Selectable,
    C48 extends Selectable,
    C49 extends Selectable,
    C50 extends Selectable,
    C51 extends Selectable,
    C52 extends Selectable,
    C53 extends Selectable,
    C54 extends Selectable,
    C55 extends Selectable,
    C56 extends Selectable,
    C57 extends Selectable,
    C58 extends Selectable,
    C59 extends Selectable,
    C60 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
    c38: C38,
    c39: C39,
    c40: C40,
    c41: C41,
    c42: C42,
    c43: C43,
    c44: C44,
    c45: C45,
    c46: C46,
    c47: C47,
    c48: C48,
    c49: C49,
    c50: C50,
    c51: C51,
    c52: C52,
    c53: C53,
    c54: C54,
    c55: C55,
    c56: C56,
    c57: C57,
    c58: C58,
    c59: C59,
    c60: C60,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37> &
      GetSelectable<C38> &
      GetSelectable<C39> &
      GetSelectable<C40> &
      GetSelectable<C41> &
      GetSelectable<C42> &
      GetSelectable<C43> &
      GetSelectable<C44> &
      GetSelectable<C45> &
      GetSelectable<C46> &
      GetSelectable<C47> &
      GetSelectable<C48> &
      GetSelectable<C49> &
      GetSelectable<C50> &
      GetSelectable<C51> &
      GetSelectable<C52> &
      GetSelectable<C53> &
      GetSelectable<C54> &
      GetSelectable<C55> &
      GetSelectable<C56> &
      GetSelectable<C57> &
      GetSelectable<C58> &
      GetSelectable<C59> &
      GetSelectable<C60>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
      | C38
      | C39
      | C40
      | C41
      | C42
      | C43
      | C44
      | C45
      | C46
      | C47
      | C48
      | C49
      | C50
      | C51
      | C52
      | C53
      | C54
      | C55
      | C56
      | C57
      | C58
      | C59
      | C60
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable,
    C38 extends Selectable,
    C39 extends Selectable,
    C40 extends Selectable,
    C41 extends Selectable,
    C42 extends Selectable,
    C43 extends Selectable,
    C44 extends Selectable,
    C45 extends Selectable,
    C46 extends Selectable,
    C47 extends Selectable,
    C48 extends Selectable,
    C49 extends Selectable,
    C50 extends Selectable,
    C51 extends Selectable,
    C52 extends Selectable,
    C53 extends Selectable,
    C54 extends Selectable,
    C55 extends Selectable,
    C56 extends Selectable,
    C57 extends Selectable,
    C58 extends Selectable,
    C59 extends Selectable,
    C60 extends Selectable,
    C61 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
    c38: C38,
    c39: C39,
    c40: C40,
    c41: C41,
    c42: C42,
    c43: C43,
    c44: C44,
    c45: C45,
    c46: C46,
    c47: C47,
    c48: C48,
    c49: C49,
    c50: C50,
    c51: C51,
    c52: C52,
    c53: C53,
    c54: C54,
    c55: C55,
    c56: C56,
    c57: C57,
    c58: C58,
    c59: C59,
    c60: C60,
    c61: C61,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37> &
      GetSelectable<C38> &
      GetSelectable<C39> &
      GetSelectable<C40> &
      GetSelectable<C41> &
      GetSelectable<C42> &
      GetSelectable<C43> &
      GetSelectable<C44> &
      GetSelectable<C45> &
      GetSelectable<C46> &
      GetSelectable<C47> &
      GetSelectable<C48> &
      GetSelectable<C49> &
      GetSelectable<C50> &
      GetSelectable<C51> &
      GetSelectable<C52> &
      GetSelectable<C53> &
      GetSelectable<C54> &
      GetSelectable<C55> &
      GetSelectable<C56> &
      GetSelectable<C57> &
      GetSelectable<C58> &
      GetSelectable<C59> &
      GetSelectable<C60> &
      GetSelectable<C61>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
      | C38
      | C39
      | C40
      | C41
      | C42
      | C43
      | C44
      | C45
      | C46
      | C47
      | C48
      | C49
      | C50
      | C51
      | C52
      | C53
      | C54
      | C55
      | C56
      | C57
      | C58
      | C59
      | C60
      | C61
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable,
    C38 extends Selectable,
    C39 extends Selectable,
    C40 extends Selectable,
    C41 extends Selectable,
    C42 extends Selectable,
    C43 extends Selectable,
    C44 extends Selectable,
    C45 extends Selectable,
    C46 extends Selectable,
    C47 extends Selectable,
    C48 extends Selectable,
    C49 extends Selectable,
    C50 extends Selectable,
    C51 extends Selectable,
    C52 extends Selectable,
    C53 extends Selectable,
    C54 extends Selectable,
    C55 extends Selectable,
    C56 extends Selectable,
    C57 extends Selectable,
    C58 extends Selectable,
    C59 extends Selectable,
    C60 extends Selectable,
    C61 extends Selectable,
    C62 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
    c38: C38,
    c39: C39,
    c40: C40,
    c41: C41,
    c42: C42,
    c43: C43,
    c44: C44,
    c45: C45,
    c46: C46,
    c47: C47,
    c48: C48,
    c49: C49,
    c50: C50,
    c51: C51,
    c52: C52,
    c53: C53,
    c54: C54,
    c55: C55,
    c56: C56,
    c57: C57,
    c58: C58,
    c59: C59,
    c60: C60,
    c61: C61,
    c62: C62,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37> &
      GetSelectable<C38> &
      GetSelectable<C39> &
      GetSelectable<C40> &
      GetSelectable<C41> &
      GetSelectable<C42> &
      GetSelectable<C43> &
      GetSelectable<C44> &
      GetSelectable<C45> &
      GetSelectable<C46> &
      GetSelectable<C47> &
      GetSelectable<C48> &
      GetSelectable<C49> &
      GetSelectable<C50> &
      GetSelectable<C51> &
      GetSelectable<C52> &
      GetSelectable<C53> &
      GetSelectable<C54> &
      GetSelectable<C55> &
      GetSelectable<C56> &
      GetSelectable<C57> &
      GetSelectable<C58> &
      GetSelectable<C59> &
      GetSelectable<C60> &
      GetSelectable<C61> &
      GetSelectable<C62>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
      | C38
      | C39
      | C40
      | C41
      | C42
      | C43
      | C44
      | C45
      | C46
      | C47
      | C48
      | C49
      | C50
      | C51
      | C52
      | C53
      | C54
      | C55
      | C56
      | C57
      | C58
      | C59
      | C60
      | C61
      | C62
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable,
    C38 extends Selectable,
    C39 extends Selectable,
    C40 extends Selectable,
    C41 extends Selectable,
    C42 extends Selectable,
    C43 extends Selectable,
    C44 extends Selectable,
    C45 extends Selectable,
    C46 extends Selectable,
    C47 extends Selectable,
    C48 extends Selectable,
    C49 extends Selectable,
    C50 extends Selectable,
    C51 extends Selectable,
    C52 extends Selectable,
    C53 extends Selectable,
    C54 extends Selectable,
    C55 extends Selectable,
    C56 extends Selectable,
    C57 extends Selectable,
    C58 extends Selectable,
    C59 extends Selectable,
    C60 extends Selectable,
    C61 extends Selectable,
    C62 extends Selectable,
    C63 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
    c38: C38,
    c39: C39,
    c40: C40,
    c41: C41,
    c42: C42,
    c43: C43,
    c44: C44,
    c45: C45,
    c46: C46,
    c47: C47,
    c48: C48,
    c49: C49,
    c50: C50,
    c51: C51,
    c52: C52,
    c53: C53,
    c54: C54,
    c55: C55,
    c56: C56,
    c57: C57,
    c58: C58,
    c59: C59,
    c60: C60,
    c61: C61,
    c62: C62,
    c63: C63,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37> &
      GetSelectable<C38> &
      GetSelectable<C39> &
      GetSelectable<C40> &
      GetSelectable<C41> &
      GetSelectable<C42> &
      GetSelectable<C43> &
      GetSelectable<C44> &
      GetSelectable<C45> &
      GetSelectable<C46> &
      GetSelectable<C47> &
      GetSelectable<C48> &
      GetSelectable<C49> &
      GetSelectable<C50> &
      GetSelectable<C51> &
      GetSelectable<C52> &
      GetSelectable<C53> &
      GetSelectable<C54> &
      GetSelectable<C55> &
      GetSelectable<C56> &
      GetSelectable<C57> &
      GetSelectable<C58> &
      GetSelectable<C59> &
      GetSelectable<C60> &
      GetSelectable<C61> &
      GetSelectable<C62> &
      GetSelectable<C63>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
      | C38
      | C39
      | C40
      | C41
      | C42
      | C43
      | C44
      | C45
      | C46
      | C47
      | C48
      | C49
      | C50
      | C51
      | C52
      | C53
      | C54
      | C55
      | C56
      | C57
      | C58
      | C59
      | C60
      | C61
      | C62
      | C63
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable,
    C38 extends Selectable,
    C39 extends Selectable,
    C40 extends Selectable,
    C41 extends Selectable,
    C42 extends Selectable,
    C43 extends Selectable,
    C44 extends Selectable,
    C45 extends Selectable,
    C46 extends Selectable,
    C47 extends Selectable,
    C48 extends Selectable,
    C49 extends Selectable,
    C50 extends Selectable,
    C51 extends Selectable,
    C52 extends Selectable,
    C53 extends Selectable,
    C54 extends Selectable,
    C55 extends Selectable,
    C56 extends Selectable,
    C57 extends Selectable,
    C58 extends Selectable,
    C59 extends Selectable,
    C60 extends Selectable,
    C61 extends Selectable,
    C62 extends Selectable,
    C63 extends Selectable,
    C64 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
    c38: C38,
    c39: C39,
    c40: C40,
    c41: C41,
    c42: C42,
    c43: C43,
    c44: C44,
    c45: C45,
    c46: C46,
    c47: C47,
    c48: C48,
    c49: C49,
    c50: C50,
    c51: C51,
    c52: C52,
    c53: C53,
    c54: C54,
    c55: C55,
    c56: C56,
    c57: C57,
    c58: C58,
    c59: C59,
    c60: C60,
    c61: C61,
    c62: C62,
    c63: C63,
    c64: C64,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37> &
      GetSelectable<C38> &
      GetSelectable<C39> &
      GetSelectable<C40> &
      GetSelectable<C41> &
      GetSelectable<C42> &
      GetSelectable<C43> &
      GetSelectable<C44> &
      GetSelectable<C45> &
      GetSelectable<C46> &
      GetSelectable<C47> &
      GetSelectable<C48> &
      GetSelectable<C49> &
      GetSelectable<C50> &
      GetSelectable<C51> &
      GetSelectable<C52> &
      GetSelectable<C53> &
      GetSelectable<C54> &
      GetSelectable<C55> &
      GetSelectable<C56> &
      GetSelectable<C57> &
      GetSelectable<C58> &
      GetSelectable<C59> &
      GetSelectable<C60> &
      GetSelectable<C61> &
      GetSelectable<C62> &
      GetSelectable<C63> &
      GetSelectable<C64>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
      | C38
      | C39
      | C40
      | C41
      | C42
      | C43
      | C44
      | C45
      | C46
      | C47
      | C48
      | C49
      | C50
      | C51
      | C52
      | C53
      | C54
      | C55
      | C56
      | C57
      | C58
      | C59
      | C60
      | C61
      | C62
      | C63
      | C64
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable,
    C38 extends Selectable,
    C39 extends Selectable,
    C40 extends Selectable,
    C41 extends Selectable,
    C42 extends Selectable,
    C43 extends Selectable,
    C44 extends Selectable,
    C45 extends Selectable,
    C46 extends Selectable,
    C47 extends Selectable,
    C48 extends Selectable,
    C49 extends Selectable,
    C50 extends Selectable,
    C51 extends Selectable,
    C52 extends Selectable,
    C53 extends Selectable,
    C54 extends Selectable,
    C55 extends Selectable,
    C56 extends Selectable,
    C57 extends Selectable,
    C58 extends Selectable,
    C59 extends Selectable,
    C60 extends Selectable,
    C61 extends Selectable,
    C62 extends Selectable,
    C63 extends Selectable,
    C64 extends Selectable,
    C65 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
    c38: C38,
    c39: C39,
    c40: C40,
    c41: C41,
    c42: C42,
    c43: C43,
    c44: C44,
    c45: C45,
    c46: C46,
    c47: C47,
    c48: C48,
    c49: C49,
    c50: C50,
    c51: C51,
    c52: C52,
    c53: C53,
    c54: C54,
    c55: C55,
    c56: C56,
    c57: C57,
    c58: C58,
    c59: C59,
    c60: C60,
    c61: C61,
    c62: C62,
    c63: C63,
    c64: C64,
    c65: C65,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37> &
      GetSelectable<C38> &
      GetSelectable<C39> &
      GetSelectable<C40> &
      GetSelectable<C41> &
      GetSelectable<C42> &
      GetSelectable<C43> &
      GetSelectable<C44> &
      GetSelectable<C45> &
      GetSelectable<C46> &
      GetSelectable<C47> &
      GetSelectable<C48> &
      GetSelectable<C49> &
      GetSelectable<C50> &
      GetSelectable<C51> &
      GetSelectable<C52> &
      GetSelectable<C53> &
      GetSelectable<C54> &
      GetSelectable<C55> &
      GetSelectable<C56> &
      GetSelectable<C57> &
      GetSelectable<C58> &
      GetSelectable<C59> &
      GetSelectable<C60> &
      GetSelectable<C61> &
      GetSelectable<C62> &
      GetSelectable<C63> &
      GetSelectable<C64> &
      GetSelectable<C65>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
      | C38
      | C39
      | C40
      | C41
      | C42
      | C43
      | C44
      | C45
      | C46
      | C47
      | C48
      | C49
      | C50
      | C51
      | C52
      | C53
      | C54
      | C55
      | C56
      | C57
      | C58
      | C59
      | C60
      | C61
      | C62
      | C63
      | C64
      | C65
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable,
    C38 extends Selectable,
    C39 extends Selectable,
    C40 extends Selectable,
    C41 extends Selectable,
    C42 extends Selectable,
    C43 extends Selectable,
    C44 extends Selectable,
    C45 extends Selectable,
    C46 extends Selectable,
    C47 extends Selectable,
    C48 extends Selectable,
    C49 extends Selectable,
    C50 extends Selectable,
    C51 extends Selectable,
    C52 extends Selectable,
    C53 extends Selectable,
    C54 extends Selectable,
    C55 extends Selectable,
    C56 extends Selectable,
    C57 extends Selectable,
    C58 extends Selectable,
    C59 extends Selectable,
    C60 extends Selectable,
    C61 extends Selectable,
    C62 extends Selectable,
    C63 extends Selectable,
    C64 extends Selectable,
    C65 extends Selectable,
    C66 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
    c38: C38,
    c39: C39,
    c40: C40,
    c41: C41,
    c42: C42,
    c43: C43,
    c44: C44,
    c45: C45,
    c46: C46,
    c47: C47,
    c48: C48,
    c49: C49,
    c50: C50,
    c51: C51,
    c52: C52,
    c53: C53,
    c54: C54,
    c55: C55,
    c56: C56,
    c57: C57,
    c58: C58,
    c59: C59,
    c60: C60,
    c61: C61,
    c62: C62,
    c63: C63,
    c64: C64,
    c65: C65,
    c66: C66,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37> &
      GetSelectable<C38> &
      GetSelectable<C39> &
      GetSelectable<C40> &
      GetSelectable<C41> &
      GetSelectable<C42> &
      GetSelectable<C43> &
      GetSelectable<C44> &
      GetSelectable<C45> &
      GetSelectable<C46> &
      GetSelectable<C47> &
      GetSelectable<C48> &
      GetSelectable<C49> &
      GetSelectable<C50> &
      GetSelectable<C51> &
      GetSelectable<C52> &
      GetSelectable<C53> &
      GetSelectable<C54> &
      GetSelectable<C55> &
      GetSelectable<C56> &
      GetSelectable<C57> &
      GetSelectable<C58> &
      GetSelectable<C59> &
      GetSelectable<C60> &
      GetSelectable<C61> &
      GetSelectable<C62> &
      GetSelectable<C63> &
      GetSelectable<C64> &
      GetSelectable<C65> &
      GetSelectable<C66>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
      | C38
      | C39
      | C40
      | C41
      | C42
      | C43
      | C44
      | C45
      | C46
      | C47
      | C48
      | C49
      | C50
      | C51
      | C52
      | C53
      | C54
      | C55
      | C56
      | C57
      | C58
      | C59
      | C60
      | C61
      | C62
      | C63
      | C64
      | C65
      | C66
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable,
    C38 extends Selectable,
    C39 extends Selectable,
    C40 extends Selectable,
    C41 extends Selectable,
    C42 extends Selectable,
    C43 extends Selectable,
    C44 extends Selectable,
    C45 extends Selectable,
    C46 extends Selectable,
    C47 extends Selectable,
    C48 extends Selectable,
    C49 extends Selectable,
    C50 extends Selectable,
    C51 extends Selectable,
    C52 extends Selectable,
    C53 extends Selectable,
    C54 extends Selectable,
    C55 extends Selectable,
    C56 extends Selectable,
    C57 extends Selectable,
    C58 extends Selectable,
    C59 extends Selectable,
    C60 extends Selectable,
    C61 extends Selectable,
    C62 extends Selectable,
    C63 extends Selectable,
    C64 extends Selectable,
    C65 extends Selectable,
    C66 extends Selectable,
    C67 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
    c38: C38,
    c39: C39,
    c40: C40,
    c41: C41,
    c42: C42,
    c43: C43,
    c44: C44,
    c45: C45,
    c46: C46,
    c47: C47,
    c48: C48,
    c49: C49,
    c50: C50,
    c51: C51,
    c52: C52,
    c53: C53,
    c54: C54,
    c55: C55,
    c56: C56,
    c57: C57,
    c58: C58,
    c59: C59,
    c60: C60,
    c61: C61,
    c62: C62,
    c63: C63,
    c64: C64,
    c65: C65,
    c66: C66,
    c67: C67,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37> &
      GetSelectable<C38> &
      GetSelectable<C39> &
      GetSelectable<C40> &
      GetSelectable<C41> &
      GetSelectable<C42> &
      GetSelectable<C43> &
      GetSelectable<C44> &
      GetSelectable<C45> &
      GetSelectable<C46> &
      GetSelectable<C47> &
      GetSelectable<C48> &
      GetSelectable<C49> &
      GetSelectable<C50> &
      GetSelectable<C51> &
      GetSelectable<C52> &
      GetSelectable<C53> &
      GetSelectable<C54> &
      GetSelectable<C55> &
      GetSelectable<C56> &
      GetSelectable<C57> &
      GetSelectable<C58> &
      GetSelectable<C59> &
      GetSelectable<C60> &
      GetSelectable<C61> &
      GetSelectable<C62> &
      GetSelectable<C63> &
      GetSelectable<C64> &
      GetSelectable<C65> &
      GetSelectable<C66> &
      GetSelectable<C67>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
      | C38
      | C39
      | C40
      | C41
      | C42
      | C43
      | C44
      | C45
      | C46
      | C47
      | C48
      | C49
      | C50
      | C51
      | C52
      | C53
      | C54
      | C55
      | C56
      | C57
      | C58
      | C59
      | C60
      | C61
      | C62
      | C63
      | C64
      | C65
      | C66
      | C67
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable,
    C38 extends Selectable,
    C39 extends Selectable,
    C40 extends Selectable,
    C41 extends Selectable,
    C42 extends Selectable,
    C43 extends Selectable,
    C44 extends Selectable,
    C45 extends Selectable,
    C46 extends Selectable,
    C47 extends Selectable,
    C48 extends Selectable,
    C49 extends Selectable,
    C50 extends Selectable,
    C51 extends Selectable,
    C52 extends Selectable,
    C53 extends Selectable,
    C54 extends Selectable,
    C55 extends Selectable,
    C56 extends Selectable,
    C57 extends Selectable,
    C58 extends Selectable,
    C59 extends Selectable,
    C60 extends Selectable,
    C61 extends Selectable,
    C62 extends Selectable,
    C63 extends Selectable,
    C64 extends Selectable,
    C65 extends Selectable,
    C66 extends Selectable,
    C67 extends Selectable,
    C68 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
    c38: C38,
    c39: C39,
    c40: C40,
    c41: C41,
    c42: C42,
    c43: C43,
    c44: C44,
    c45: C45,
    c46: C46,
    c47: C47,
    c48: C48,
    c49: C49,
    c50: C50,
    c51: C51,
    c52: C52,
    c53: C53,
    c54: C54,
    c55: C55,
    c56: C56,
    c57: C57,
    c58: C58,
    c59: C59,
    c60: C60,
    c61: C61,
    c62: C62,
    c63: C63,
    c64: C64,
    c65: C65,
    c66: C66,
    c67: C67,
    c68: C68,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37> &
      GetSelectable<C38> &
      GetSelectable<C39> &
      GetSelectable<C40> &
      GetSelectable<C41> &
      GetSelectable<C42> &
      GetSelectable<C43> &
      GetSelectable<C44> &
      GetSelectable<C45> &
      GetSelectable<C46> &
      GetSelectable<C47> &
      GetSelectable<C48> &
      GetSelectable<C49> &
      GetSelectable<C50> &
      GetSelectable<C51> &
      GetSelectable<C52> &
      GetSelectable<C53> &
      GetSelectable<C54> &
      GetSelectable<C55> &
      GetSelectable<C56> &
      GetSelectable<C57> &
      GetSelectable<C58> &
      GetSelectable<C59> &
      GetSelectable<C60> &
      GetSelectable<C61> &
      GetSelectable<C62> &
      GetSelectable<C63> &
      GetSelectable<C64> &
      GetSelectable<C65> &
      GetSelectable<C66> &
      GetSelectable<C67> &
      GetSelectable<C68>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
      | C38
      | C39
      | C40
      | C41
      | C42
      | C43
      | C44
      | C45
      | C46
      | C47
      | C48
      | C49
      | C50
      | C51
      | C52
      | C53
      | C54
      | C55
      | C56
      | C57
      | C58
      | C59
      | C60
      | C61
      | C62
      | C63
      | C64
      | C65
      | C66
      | C67
      | C68
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable,
    C38 extends Selectable,
    C39 extends Selectable,
    C40 extends Selectable,
    C41 extends Selectable,
    C42 extends Selectable,
    C43 extends Selectable,
    C44 extends Selectable,
    C45 extends Selectable,
    C46 extends Selectable,
    C47 extends Selectable,
    C48 extends Selectable,
    C49 extends Selectable,
    C50 extends Selectable,
    C51 extends Selectable,
    C52 extends Selectable,
    C53 extends Selectable,
    C54 extends Selectable,
    C55 extends Selectable,
    C56 extends Selectable,
    C57 extends Selectable,
    C58 extends Selectable,
    C59 extends Selectable,
    C60 extends Selectable,
    C61 extends Selectable,
    C62 extends Selectable,
    C63 extends Selectable,
    C64 extends Selectable,
    C65 extends Selectable,
    C66 extends Selectable,
    C67 extends Selectable,
    C68 extends Selectable,
    C69 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
    c38: C38,
    c39: C39,
    c40: C40,
    c41: C41,
    c42: C42,
    c43: C43,
    c44: C44,
    c45: C45,
    c46: C46,
    c47: C47,
    c48: C48,
    c49: C49,
    c50: C50,
    c51: C51,
    c52: C52,
    c53: C53,
    c54: C54,
    c55: C55,
    c56: C56,
    c57: C57,
    c58: C58,
    c59: C59,
    c60: C60,
    c61: C61,
    c62: C62,
    c63: C63,
    c64: C64,
    c65: C65,
    c66: C66,
    c67: C67,
    c68: C68,
    c69: C69,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37> &
      GetSelectable<C38> &
      GetSelectable<C39> &
      GetSelectable<C40> &
      GetSelectable<C41> &
      GetSelectable<C42> &
      GetSelectable<C43> &
      GetSelectable<C44> &
      GetSelectable<C45> &
      GetSelectable<C46> &
      GetSelectable<C47> &
      GetSelectable<C48> &
      GetSelectable<C49> &
      GetSelectable<C50> &
      GetSelectable<C51> &
      GetSelectable<C52> &
      GetSelectable<C53> &
      GetSelectable<C54> &
      GetSelectable<C55> &
      GetSelectable<C56> &
      GetSelectable<C57> &
      GetSelectable<C58> &
      GetSelectable<C59> &
      GetSelectable<C60> &
      GetSelectable<C61> &
      GetSelectable<C62> &
      GetSelectable<C63> &
      GetSelectable<C64> &
      GetSelectable<C65> &
      GetSelectable<C66> &
      GetSelectable<C67> &
      GetSelectable<C68> &
      GetSelectable<C69>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
      | C38
      | C39
      | C40
      | C41
      | C42
      | C43
      | C44
      | C45
      | C46
      | C47
      | C48
      | C49
      | C50
      | C51
      | C52
      | C53
      | C54
      | C55
      | C56
      | C57
      | C58
      | C59
      | C60
      | C61
      | C62
      | C63
      | C64
      | C65
      | C66
      | C67
      | C68
      | C69
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable,
    C38 extends Selectable,
    C39 extends Selectable,
    C40 extends Selectable,
    C41 extends Selectable,
    C42 extends Selectable,
    C43 extends Selectable,
    C44 extends Selectable,
    C45 extends Selectable,
    C46 extends Selectable,
    C47 extends Selectable,
    C48 extends Selectable,
    C49 extends Selectable,
    C50 extends Selectable,
    C51 extends Selectable,
    C52 extends Selectable,
    C53 extends Selectable,
    C54 extends Selectable,
    C55 extends Selectable,
    C56 extends Selectable,
    C57 extends Selectable,
    C58 extends Selectable,
    C59 extends Selectable,
    C60 extends Selectable,
    C61 extends Selectable,
    C62 extends Selectable,
    C63 extends Selectable,
    C64 extends Selectable,
    C65 extends Selectable,
    C66 extends Selectable,
    C67 extends Selectable,
    C68 extends Selectable,
    C69 extends Selectable,
    C70 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
    c38: C38,
    c39: C39,
    c40: C40,
    c41: C41,
    c42: C42,
    c43: C43,
    c44: C44,
    c45: C45,
    c46: C46,
    c47: C47,
    c48: C48,
    c49: C49,
    c50: C50,
    c51: C51,
    c52: C52,
    c53: C53,
    c54: C54,
    c55: C55,
    c56: C56,
    c57: C57,
    c58: C58,
    c59: C59,
    c60: C60,
    c61: C61,
    c62: C62,
    c63: C63,
    c64: C64,
    c65: C65,
    c66: C66,
    c67: C67,
    c68: C68,
    c69: C69,
    c70: C70,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37> &
      GetSelectable<C38> &
      GetSelectable<C39> &
      GetSelectable<C40> &
      GetSelectable<C41> &
      GetSelectable<C42> &
      GetSelectable<C43> &
      GetSelectable<C44> &
      GetSelectable<C45> &
      GetSelectable<C46> &
      GetSelectable<C47> &
      GetSelectable<C48> &
      GetSelectable<C49> &
      GetSelectable<C50> &
      GetSelectable<C51> &
      GetSelectable<C52> &
      GetSelectable<C53> &
      GetSelectable<C54> &
      GetSelectable<C55> &
      GetSelectable<C56> &
      GetSelectable<C57> &
      GetSelectable<C58> &
      GetSelectable<C59> &
      GetSelectable<C60> &
      GetSelectable<C61> &
      GetSelectable<C62> &
      GetSelectable<C63> &
      GetSelectable<C64> &
      GetSelectable<C65> &
      GetSelectable<C66> &
      GetSelectable<C67> &
      GetSelectable<C68> &
      GetSelectable<C69> &
      GetSelectable<C70>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
      | C38
      | C39
      | C40
      | C41
      | C42
      | C43
      | C44
      | C45
      | C46
      | C47
      | C48
      | C49
      | C50
      | C51
      | C52
      | C53
      | C54
      | C55
      | C56
      | C57
      | C58
      | C59
      | C60
      | C61
      | C62
      | C63
      | C64
      | C65
      | C66
      | C67
      | C68
      | C69
      | C70
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable,
    C38 extends Selectable,
    C39 extends Selectable,
    C40 extends Selectable,
    C41 extends Selectable,
    C42 extends Selectable,
    C43 extends Selectable,
    C44 extends Selectable,
    C45 extends Selectable,
    C46 extends Selectable,
    C47 extends Selectable,
    C48 extends Selectable,
    C49 extends Selectable,
    C50 extends Selectable,
    C51 extends Selectable,
    C52 extends Selectable,
    C53 extends Selectable,
    C54 extends Selectable,
    C55 extends Selectable,
    C56 extends Selectable,
    C57 extends Selectable,
    C58 extends Selectable,
    C59 extends Selectable,
    C60 extends Selectable,
    C61 extends Selectable,
    C62 extends Selectable,
    C63 extends Selectable,
    C64 extends Selectable,
    C65 extends Selectable,
    C66 extends Selectable,
    C67 extends Selectable,
    C68 extends Selectable,
    C69 extends Selectable,
    C70 extends Selectable,
    C71 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
    c38: C38,
    c39: C39,
    c40: C40,
    c41: C41,
    c42: C42,
    c43: C43,
    c44: C44,
    c45: C45,
    c46: C46,
    c47: C47,
    c48: C48,
    c49: C49,
    c50: C50,
    c51: C51,
    c52: C52,
    c53: C53,
    c54: C54,
    c55: C55,
    c56: C56,
    c57: C57,
    c58: C58,
    c59: C59,
    c60: C60,
    c61: C61,
    c62: C62,
    c63: C63,
    c64: C64,
    c65: C65,
    c66: C66,
    c67: C67,
    c68: C68,
    c69: C69,
    c70: C70,
    c71: C71,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37> &
      GetSelectable<C38> &
      GetSelectable<C39> &
      GetSelectable<C40> &
      GetSelectable<C41> &
      GetSelectable<C42> &
      GetSelectable<C43> &
      GetSelectable<C44> &
      GetSelectable<C45> &
      GetSelectable<C46> &
      GetSelectable<C47> &
      GetSelectable<C48> &
      GetSelectable<C49> &
      GetSelectable<C50> &
      GetSelectable<C51> &
      GetSelectable<C52> &
      GetSelectable<C53> &
      GetSelectable<C54> &
      GetSelectable<C55> &
      GetSelectable<C56> &
      GetSelectable<C57> &
      GetSelectable<C58> &
      GetSelectable<C59> &
      GetSelectable<C60> &
      GetSelectable<C61> &
      GetSelectable<C62> &
      GetSelectable<C63> &
      GetSelectable<C64> &
      GetSelectable<C65> &
      GetSelectable<C66> &
      GetSelectable<C67> &
      GetSelectable<C68> &
      GetSelectable<C69> &
      GetSelectable<C70> &
      GetSelectable<C71>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
      | C38
      | C39
      | C40
      | C41
      | C42
      | C43
      | C44
      | C45
      | C46
      | C47
      | C48
      | C49
      | C50
      | C51
      | C52
      | C53
      | C54
      | C55
      | C56
      | C57
      | C58
      | C59
      | C60
      | C61
      | C62
      | C63
      | C64
      | C65
      | C66
      | C67
      | C68
      | C69
      | C70
      | C71
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable,
    C38 extends Selectable,
    C39 extends Selectable,
    C40 extends Selectable,
    C41 extends Selectable,
    C42 extends Selectable,
    C43 extends Selectable,
    C44 extends Selectable,
    C45 extends Selectable,
    C46 extends Selectable,
    C47 extends Selectable,
    C48 extends Selectable,
    C49 extends Selectable,
    C50 extends Selectable,
    C51 extends Selectable,
    C52 extends Selectable,
    C53 extends Selectable,
    C54 extends Selectable,
    C55 extends Selectable,
    C56 extends Selectable,
    C57 extends Selectable,
    C58 extends Selectable,
    C59 extends Selectable,
    C60 extends Selectable,
    C61 extends Selectable,
    C62 extends Selectable,
    C63 extends Selectable,
    C64 extends Selectable,
    C65 extends Selectable,
    C66 extends Selectable,
    C67 extends Selectable,
    C68 extends Selectable,
    C69 extends Selectable,
    C70 extends Selectable,
    C71 extends Selectable,
    C72 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
    c38: C38,
    c39: C39,
    c40: C40,
    c41: C41,
    c42: C42,
    c43: C43,
    c44: C44,
    c45: C45,
    c46: C46,
    c47: C47,
    c48: C48,
    c49: C49,
    c50: C50,
    c51: C51,
    c52: C52,
    c53: C53,
    c54: C54,
    c55: C55,
    c56: C56,
    c57: C57,
    c58: C58,
    c59: C59,
    c60: C60,
    c61: C61,
    c62: C62,
    c63: C63,
    c64: C64,
    c65: C65,
    c66: C66,
    c67: C67,
    c68: C68,
    c69: C69,
    c70: C70,
    c71: C71,
    c72: C72,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37> &
      GetSelectable<C38> &
      GetSelectable<C39> &
      GetSelectable<C40> &
      GetSelectable<C41> &
      GetSelectable<C42> &
      GetSelectable<C43> &
      GetSelectable<C44> &
      GetSelectable<C45> &
      GetSelectable<C46> &
      GetSelectable<C47> &
      GetSelectable<C48> &
      GetSelectable<C49> &
      GetSelectable<C50> &
      GetSelectable<C51> &
      GetSelectable<C52> &
      GetSelectable<C53> &
      GetSelectable<C54> &
      GetSelectable<C55> &
      GetSelectable<C56> &
      GetSelectable<C57> &
      GetSelectable<C58> &
      GetSelectable<C59> &
      GetSelectable<C60> &
      GetSelectable<C61> &
      GetSelectable<C62> &
      GetSelectable<C63> &
      GetSelectable<C64> &
      GetSelectable<C65> &
      GetSelectable<C66> &
      GetSelectable<C67> &
      GetSelectable<C68> &
      GetSelectable<C69> &
      GetSelectable<C70> &
      GetSelectable<C71> &
      GetSelectable<C72>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
      | C38
      | C39
      | C40
      | C41
      | C42
      | C43
      | C44
      | C45
      | C46
      | C47
      | C48
      | C49
      | C50
      | C51
      | C52
      | C53
      | C54
      | C55
      | C56
      | C57
      | C58
      | C59
      | C60
      | C61
      | C62
      | C63
      | C64
      | C65
      | C66
      | C67
      | C68
      | C69
      | C70
      | C71
      | C72
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable,
    C38 extends Selectable,
    C39 extends Selectable,
    C40 extends Selectable,
    C41 extends Selectable,
    C42 extends Selectable,
    C43 extends Selectable,
    C44 extends Selectable,
    C45 extends Selectable,
    C46 extends Selectable,
    C47 extends Selectable,
    C48 extends Selectable,
    C49 extends Selectable,
    C50 extends Selectable,
    C51 extends Selectable,
    C52 extends Selectable,
    C53 extends Selectable,
    C54 extends Selectable,
    C55 extends Selectable,
    C56 extends Selectable,
    C57 extends Selectable,
    C58 extends Selectable,
    C59 extends Selectable,
    C60 extends Selectable,
    C61 extends Selectable,
    C62 extends Selectable,
    C63 extends Selectable,
    C64 extends Selectable,
    C65 extends Selectable,
    C66 extends Selectable,
    C67 extends Selectable,
    C68 extends Selectable,
    C69 extends Selectable,
    C70 extends Selectable,
    C71 extends Selectable,
    C72 extends Selectable,
    C73 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
    c38: C38,
    c39: C39,
    c40: C40,
    c41: C41,
    c42: C42,
    c43: C43,
    c44: C44,
    c45: C45,
    c46: C46,
    c47: C47,
    c48: C48,
    c49: C49,
    c50: C50,
    c51: C51,
    c52: C52,
    c53: C53,
    c54: C54,
    c55: C55,
    c56: C56,
    c57: C57,
    c58: C58,
    c59: C59,
    c60: C60,
    c61: C61,
    c62: C62,
    c63: C63,
    c64: C64,
    c65: C65,
    c66: C66,
    c67: C67,
    c68: C68,
    c69: C69,
    c70: C70,
    c71: C71,
    c72: C72,
    c73: C73,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37> &
      GetSelectable<C38> &
      GetSelectable<C39> &
      GetSelectable<C40> &
      GetSelectable<C41> &
      GetSelectable<C42> &
      GetSelectable<C43> &
      GetSelectable<C44> &
      GetSelectable<C45> &
      GetSelectable<C46> &
      GetSelectable<C47> &
      GetSelectable<C48> &
      GetSelectable<C49> &
      GetSelectable<C50> &
      GetSelectable<C51> &
      GetSelectable<C52> &
      GetSelectable<C53> &
      GetSelectable<C54> &
      GetSelectable<C55> &
      GetSelectable<C56> &
      GetSelectable<C57> &
      GetSelectable<C58> &
      GetSelectable<C59> &
      GetSelectable<C60> &
      GetSelectable<C61> &
      GetSelectable<C62> &
      GetSelectable<C63> &
      GetSelectable<C64> &
      GetSelectable<C65> &
      GetSelectable<C66> &
      GetSelectable<C67> &
      GetSelectable<C68> &
      GetSelectable<C69> &
      GetSelectable<C70> &
      GetSelectable<C71> &
      GetSelectable<C72> &
      GetSelectable<C73>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
      | C38
      | C39
      | C40
      | C41
      | C42
      | C43
      | C44
      | C45
      | C46
      | C47
      | C48
      | C49
      | C50
      | C51
      | C52
      | C53
      | C54
      | C55
      | C56
      | C57
      | C58
      | C59
      | C60
      | C61
      | C62
      | C63
      | C64
      | C65
      | C66
      | C67
      | C68
      | C69
      | C70
      | C71
      | C72
      | C73
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable,
    C38 extends Selectable,
    C39 extends Selectable,
    C40 extends Selectable,
    C41 extends Selectable,
    C42 extends Selectable,
    C43 extends Selectable,
    C44 extends Selectable,
    C45 extends Selectable,
    C46 extends Selectable,
    C47 extends Selectable,
    C48 extends Selectable,
    C49 extends Selectable,
    C50 extends Selectable,
    C51 extends Selectable,
    C52 extends Selectable,
    C53 extends Selectable,
    C54 extends Selectable,
    C55 extends Selectable,
    C56 extends Selectable,
    C57 extends Selectable,
    C58 extends Selectable,
    C59 extends Selectable,
    C60 extends Selectable,
    C61 extends Selectable,
    C62 extends Selectable,
    C63 extends Selectable,
    C64 extends Selectable,
    C65 extends Selectable,
    C66 extends Selectable,
    C67 extends Selectable,
    C68 extends Selectable,
    C69 extends Selectable,
    C70 extends Selectable,
    C71 extends Selectable,
    C72 extends Selectable,
    C73 extends Selectable,
    C74 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
    c38: C38,
    c39: C39,
    c40: C40,
    c41: C41,
    c42: C42,
    c43: C43,
    c44: C44,
    c45: C45,
    c46: C46,
    c47: C47,
    c48: C48,
    c49: C49,
    c50: C50,
    c51: C51,
    c52: C52,
    c53: C53,
    c54: C54,
    c55: C55,
    c56: C56,
    c57: C57,
    c58: C58,
    c59: C59,
    c60: C60,
    c61: C61,
    c62: C62,
    c63: C63,
    c64: C64,
    c65: C65,
    c66: C66,
    c67: C67,
    c68: C68,
    c69: C69,
    c70: C70,
    c71: C71,
    c72: C72,
    c73: C73,
    c74: C74,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37> &
      GetSelectable<C38> &
      GetSelectable<C39> &
      GetSelectable<C40> &
      GetSelectable<C41> &
      GetSelectable<C42> &
      GetSelectable<C43> &
      GetSelectable<C44> &
      GetSelectable<C45> &
      GetSelectable<C46> &
      GetSelectable<C47> &
      GetSelectable<C48> &
      GetSelectable<C49> &
      GetSelectable<C50> &
      GetSelectable<C51> &
      GetSelectable<C52> &
      GetSelectable<C53> &
      GetSelectable<C54> &
      GetSelectable<C55> &
      GetSelectable<C56> &
      GetSelectable<C57> &
      GetSelectable<C58> &
      GetSelectable<C59> &
      GetSelectable<C60> &
      GetSelectable<C61> &
      GetSelectable<C62> &
      GetSelectable<C63> &
      GetSelectable<C64> &
      GetSelectable<C65> &
      GetSelectable<C66> &
      GetSelectable<C67> &
      GetSelectable<C68> &
      GetSelectable<C69> &
      GetSelectable<C70> &
      GetSelectable<C71> &
      GetSelectable<C72> &
      GetSelectable<C73> &
      GetSelectable<C74>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
      | C38
      | C39
      | C40
      | C41
      | C42
      | C43
      | C44
      | C45
      | C46
      | C47
      | C48
      | C49
      | C50
      | C51
      | C52
      | C53
      | C54
      | C55
      | C56
      | C57
      | C58
      | C59
      | C60
      | C61
      | C62
      | C63
      | C64
      | C65
      | C66
      | C67
      | C68
      | C69
      | C70
      | C71
      | C72
      | C73
      | C74
    >
  >;
  <
    C1 extends Selectable,
    C2 extends Selectable,
    C3 extends Selectable,
    C4 extends Selectable,
    C5 extends Selectable,
    C6 extends Selectable,
    C7 extends Selectable,
    C8 extends Selectable,
    C9 extends Selectable,
    C10 extends Selectable,
    C11 extends Selectable,
    C12 extends Selectable,
    C13 extends Selectable,
    C14 extends Selectable,
    C15 extends Selectable,
    C16 extends Selectable,
    C17 extends Selectable,
    C18 extends Selectable,
    C19 extends Selectable,
    C20 extends Selectable,
    C21 extends Selectable,
    C22 extends Selectable,
    C23 extends Selectable,
    C24 extends Selectable,
    C25 extends Selectable,
    C26 extends Selectable,
    C27 extends Selectable,
    C28 extends Selectable,
    C29 extends Selectable,
    C30 extends Selectable,
    C31 extends Selectable,
    C32 extends Selectable,
    C33 extends Selectable,
    C34 extends Selectable,
    C35 extends Selectable,
    C36 extends Selectable,
    C37 extends Selectable,
    C38 extends Selectable,
    C39 extends Selectable,
    C40 extends Selectable,
    C41 extends Selectable,
    C42 extends Selectable,
    C43 extends Selectable,
    C44 extends Selectable,
    C45 extends Selectable,
    C46 extends Selectable,
    C47 extends Selectable,
    C48 extends Selectable,
    C49 extends Selectable,
    C50 extends Selectable,
    C51 extends Selectable,
    C52 extends Selectable,
    C53 extends Selectable,
    C54 extends Selectable,
    C55 extends Selectable,
    C56 extends Selectable,
    C57 extends Selectable,
    C58 extends Selectable,
    C59 extends Selectable,
    C60 extends Selectable,
    C61 extends Selectable,
    C62 extends Selectable,
    C63 extends Selectable,
    C64 extends Selectable,
    C65 extends Selectable,
    C66 extends Selectable,
    C67 extends Selectable,
    C68 extends Selectable,
    C69 extends Selectable,
    C70 extends Selectable,
    C71 extends Selectable,
    C72 extends Selectable,
    C73 extends Selectable,
    C74 extends Selectable,
    C75 extends Selectable
  >(
    c1: C1,
    c2: C2,
    c3: C3,
    c4: C4,
    c5: C5,
    c6: C6,
    c7: C7,
    c8: C8,
    c9: C9,
    c10: C10,
    c11: C11,
    c12: C12,
    c13: C13,
    c14: C14,
    c15: C15,
    c16: C16,
    c17: C17,
    c18: C18,
    c19: C19,
    c20: C20,
    c21: C21,
    c22: C22,
    c23: C23,
    c24: C24,
    c25: C25,
    c26: C26,
    c27: C27,
    c28: C28,
    c29: C29,
    c30: C30,
    c31: C31,
    c32: C32,
    c33: C33,
    c34: C34,
    c35: C35,
    c36: C36,
    c37: C37,
    c38: C38,
    c39: C39,
    c40: C40,
    c41: C41,
    c42: C42,
    c43: C43,
    c44: C44,
    c45: C45,
    c46: C46,
    c47: C47,
    c48: C48,
    c49: C49,
    c50: C50,
    c51: C51,
    c52: C52,
    c53: C53,
    c54: C54,
    c55: C55,
    c56: C56,
    c57: C57,
    c58: C58,
    c59: C59,
    c60: C60,
    c61: C61,
    c62: C62,
    c63: C63,
    c64: C64,
    c65: C65,
    c66: C66,
    c67: C67,
    c68: C68,
    c69: C69,
    c70: C70,
    c71: C71,
    c72: C72,
    c73: C73,
    c74: C74,
    c75: C75,
  ): SelectQuery<
    GetSelectable<C1> &
      GetSelectable<C2> &
      GetSelectable<C3> &
      GetSelectable<C4> &
      GetSelectable<C5> &
      GetSelectable<C6> &
      GetSelectable<C7> &
      GetSelectable<C8> &
      GetSelectable<C9> &
      GetSelectable<C10> &
      GetSelectable<C11> &
      GetSelectable<C12> &
      GetSelectable<C13> &
      GetSelectable<C14> &
      GetSelectable<C15> &
      GetSelectable<C16> &
      GetSelectable<C17> &
      GetSelectable<C18> &
      GetSelectable<C19> &
      GetSelectable<C20> &
      GetSelectable<C21> &
      GetSelectable<C22> &
      GetSelectable<C23> &
      GetSelectable<C24> &
      GetSelectable<C25> &
      GetSelectable<C26> &
      GetSelectable<C27> &
      GetSelectable<C28> &
      GetSelectable<C29> &
      GetSelectable<C30> &
      GetSelectable<C31> &
      GetSelectable<C32> &
      GetSelectable<C33> &
      GetSelectable<C34> &
      GetSelectable<C35> &
      GetSelectable<C36> &
      GetSelectable<C37> &
      GetSelectable<C38> &
      GetSelectable<C39> &
      GetSelectable<C40> &
      GetSelectable<C41> &
      GetSelectable<C42> &
      GetSelectable<C43> &
      GetSelectable<C44> &
      GetSelectable<C45> &
      GetSelectable<C46> &
      GetSelectable<C47> &
      GetSelectable<C48> &
      GetSelectable<C49> &
      GetSelectable<C50> &
      GetSelectable<C51> &
      GetSelectable<C52> &
      GetSelectable<C53> &
      GetSelectable<C54> &
      GetSelectable<C55> &
      GetSelectable<C56> &
      GetSelectable<C57> &
      GetSelectable<C58> &
      GetSelectable<C59> &
      GetSelectable<C60> &
      GetSelectable<C61> &
      GetSelectable<C62> &
      GetSelectable<C63> &
      GetSelectable<C64> &
      GetSelectable<C65> &
      GetSelectable<C66> &
      GetSelectable<C67> &
      GetSelectable<C68> &
      GetSelectable<C69> &
      GetSelectable<C70> &
      GetSelectable<C71> &
      GetSelectable<C72> &
      GetSelectable<C73> &
      GetSelectable<C74> &
      GetSelectable<C75>,
    ContainsStar<
      | C1
      | C2
      | C3
      | C4
      | C5
      | C6
      | C7
      | C8
      | C9
      | C10
      | C11
      | C12
      | C13
      | C14
      | C15
      | C16
      | C17
      | C18
      | C19
      | C20
      | C21
      | C22
      | C23
      | C24
      | C25
      | C26
      | C27
      | C28
      | C29
      | C30
      | C31
      | C32
      | C33
      | C34
      | C35
      | C36
      | C37
      | C38
      | C39
      | C40
      | C41
      | C42
      | C43
      | C44
      | C45
      | C46
      | C47
      | C48
      | C49
      | C50
      | C51
      | C52
      | C53
      | C54
      | C55
      | C56
      | C57
      | C58
      | C59
      | C60
      | C61
      | C62
      | C63
      | C64
      | C65
      | C66
      | C67
      | C68
      | C69
      | C70
      | C71
      | C72
      | C73
      | C74
      | C75
    >
  >;
}
