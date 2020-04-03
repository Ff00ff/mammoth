export interface QueryResult<T = any> {
  rows: T[];
  count: number;
}

export interface Backend {
  query<T>(text: string, parameters?: any[]): Promise<QueryResult<T>>;
  transaction(callback: (backend: Backend) => Promise<any>): Promise<any>;
  destroy(): Promise<void>;
}
