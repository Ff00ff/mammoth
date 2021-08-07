import type { AnyTable } from '../TableType';
import type { TableToken } from './table-token';

export abstract class Token {
  abstract reduce(state: any, numberOfParameters: number, tables: AnyTable[]): any;
}

export interface State {
  text: string[];
  parameters: any[];
}

export const createQueryState = (
  tokens: Token[],
  currentParameterIndex: number = 0,
  existingTables?: AnyTable[],
): State => {
  const initialState = {
    text: [],
    parameters: [],
  };

  // We look for every table or from item in the tokens so we pass that through the tokens.
  const tables = [
    ...(existingTables ?? []),
    ...tokens
      .filter((token) => 'getTable' in token)
      .map((tableToken) => (tableToken as unknown as TableToken).getTable()),
  ];

  return tokens.reduce(
    (tokenState, token) =>
      token.reduce(tokenState, tokenState.parameters.length + currentParameterIndex, tables),
    initialState,
  );
};
