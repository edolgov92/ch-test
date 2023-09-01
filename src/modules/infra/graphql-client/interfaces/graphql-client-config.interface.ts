export interface GraphQLClientConfig {
  endpoint: string;
  rateLimitIntervalMs?: number;
  rateLimitRequestsPerInterval?: number;
  retries?: number;
}
