import { Token } from './token';
export declare class RawToken extends Token {
    string: string;
    constructor(string: string);
    reduce(state: any): any;
}
