export interface QueryResult {
  rows: any[];
  count: number;
}

export interface Backend {
  query(text: string, parameters?: any[]): Promise<QueryResult>;
  transaction(callback: (backend: Backend) => Promise<any>): Promise<any>;
  destroy(): Promise<void>;
}
