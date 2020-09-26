export abstract class Token {
  abstract reduce(state: any, numberOfParameters: number): any;
}

export interface State {
  text: string[];
  parameters: any[];
}

export const createQueryState = (tokens: Token[], currentParameterIndex: number = 0): State => {
  const initialState = {
    text: [],
    parameters: [],
  };

  return tokens.reduce(
    (tokenState, token) =>
      token.reduce(tokenState, tokenState.parameters.length + currentParameterIndex),
    initialState
  );
};
