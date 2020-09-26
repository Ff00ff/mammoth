import { Token, createQueryState } from '../../tokens';

export const toSnap = (query: { toTokens: () => Token[] }) => {
  const queryState = createQueryState(query.toTokens());

  return {
    text: queryState.text.join(` `),
    parameters: queryState.parameters,
  };
};
