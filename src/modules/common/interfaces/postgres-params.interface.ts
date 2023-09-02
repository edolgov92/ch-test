export interface PostgresParams {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  schema?: string;
}
