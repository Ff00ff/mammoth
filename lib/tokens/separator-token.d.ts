import { State } from '../query';
import { Token } from './token';
export declare type Separator = ',';
export declare class SeparatorToken extends Token {
    separator: Separator;
    tokens: Token[];
    constructor(separator: Separator, tokens: Token[]);
    reduce(state: State): State;
}
