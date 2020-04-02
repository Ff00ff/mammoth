import { PartialQuery, Tokenable } from './query';
import { GroupToken, StringToken } from './tokens';

export * from './database';
export * from './columns';
export * from './columns/dataTypes';
export * from './keywords';
export * from './defines';
export * from './types';

// TODO: move this to expressions.

export const not = (tokenable: Tokenable) =>
  new PartialQuery(new StringToken(`NOT`), new GroupToken(tokenable.toTokens()));
