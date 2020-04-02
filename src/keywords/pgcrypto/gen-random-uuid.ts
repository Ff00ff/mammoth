import { StringToken } from './../../tokens';
import { Keyword } from '../../keywords';

export class GenRandomUuid extends Keyword {
  toTokens() {
    return [new StringToken(`gen_random_uuid()`)];
  }
}
