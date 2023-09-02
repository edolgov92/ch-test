import { QueueType } from '../../modules/infra/queue/enums';

export interface ApiConfig {
  name: string;
  description: string;
  version: string;
  url: string;
}

export interface AuthConfig {
  accessTokenExpiresInSec: number;
  accessTokenSecret: string;
  refreshTokenExpiresInSec: number;
}

export interface QueueConfig {
  type: QueueType;
  url: string;
}

export interface RateLimitConfig {
  intervalMs: number;
  requestsPerInterval: number;
}

export interface ProxyServiceConfig {
  testUsersData: string;
}

export interface SourceServiceConfig {
  sendEventsIntervalMs: number;
  testUserCredentials: string;
}

export interface TargetServiceConfig {
  graphqlUrl: string;
  requestRetries: number;
  rateLimit: RateLimitConfig;
}

export interface ServicesConfig {
  proxy: ProxyServiceConfig;
  source: SourceServiceConfig;
  target: TargetServiceConfig;
}

export interface Environment {
  port: number;
  containerAppReplicaName: string;
  graphQLClientTestingMode: boolean;
  api: ApiConfig;
  auth: AuthConfig;
  queue: QueueConfig;
  rateLimit: RateLimitConfig;
  services: ServicesConfig;
}
