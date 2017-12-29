import Simulator from '../sql-simulator';
export declare const createSql: (from: Simulator, to: Simulator, shouldGenerateNames?: boolean) => {
    queries: string[];
    names: string[];
};
export default createSql;
