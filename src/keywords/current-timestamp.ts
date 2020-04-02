import { StringToken } from './../tokens/string-token';
import { Keyword } from '../keywords';

export class CurrentTimestamp extends Keyword {
  toTokens() {
    return [new StringToken(`CURRENT_TIMESTAMP`)];
  }
}
