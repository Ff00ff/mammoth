import { StringToken } from "../tokens";

export abstract class Keyword {
  abstract toSql(): string;

  toTokens() {
    return [
      new StringToken(this.toSql()),
    ];
  }
}

export * from './current-timestamp';
export * from './default';
export * from './now';
export * from './uuid-generate-v4';