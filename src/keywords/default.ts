import { StringToken } from '../tokens';
import { Keyword } from '../keywords';

export class Default extends Keyword {
  toTokens() {
    return [new StringToken(`DEFAULT`)];
  }
}
