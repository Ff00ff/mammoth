import { Token } from './token';
export declare class ParameterToken extends Token {
    parameter: any;
    constructor(parameter: any);
    reduce(state: any, numberOfParameters: number): any;
}
