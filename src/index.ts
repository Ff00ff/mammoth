import { Now } from './keywords';
import { PartialQuery, Tokenable } from './query';
import { GroupToken, StringToken } from './tokens';

export * from './database';
export * from './database/pool';
export * from './columns';
export * from './transaction';
export * from './unsafe';
export * from './keywords';

// TODO: move this to expressions.

export const not = (tokenable: Tokenable) => new PartialQuery(
    new StringToken(`NOT`),
    new GroupToken(tokenable.toTokens()),
  );

export const now = () => new PartialQuery(...new Now().toTokens());