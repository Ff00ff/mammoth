import { Database } from "../../database";
export declare const rollback: (db: Database, migrationsDir: string) => Promise<void>;
