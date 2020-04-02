import { Token } from '../tokens';

export abstract class Keyword {
  abstract toTokens(): Token[];
}

export * from './current-timestamp';
export * from './date';
export * from './default';
export * from './now';
export * from './uuid-ossp';
export * from './pgcrypto';
export * from './unsafe';
