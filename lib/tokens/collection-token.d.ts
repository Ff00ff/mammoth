import { State } from '../query';
import { Token } from './token';
export declare class CollectionToken extends Token {
    tokens: Token[];
    constructor(tokens: Token[]);
    reduce(state: State): State;
}
