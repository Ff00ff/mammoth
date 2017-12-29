import { Token } from './token';
export declare class StringToken extends Token {
    string: string;
    constructor(string: string);
    reduce(state: any): any;
}
