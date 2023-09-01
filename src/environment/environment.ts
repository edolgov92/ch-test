import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as shortUUID from 'short-uuid';
import { QueueType } from '../modules/infra/queue/enums';

const data: { name: string; description: string; version: string } = JSON.parse(
  fs.readFileSync('package.json').toString(),
);

export const environment = {
  port: process.env.PORT || 4000,
  containerAppReplicaName: process.env.CONTAINER_APP_REPLICA_NAME || shortUUID.generate(),
  api: {
    name: data.name,
    description: data.description,
    version: data.version,
    url: process.env.API_URL || 'http://localhost:4000',
  },
  auth: {
    accessTokenExpiresInSec: parseInt(process.env.AUTH_ACCESS_TOKEN_EXPIRES_IN_SEC) || 60,
    accessTokenSecret: process.env.AUTH_ACCESS_TOKEN_SECRET || 'test-secret',
    refreshTokenExpiresInSec: parseInt(process.env.AUTH_REFRESH_TOKEN_EXPIRES_IN_SEC) || 120,
  },
  queue: {
    type: (process.env.QUEUE_TYPE as QueueType) || QueueType.InMemory,
    url: process.env.QUEUE_URL || '',
  },
  rateLimit: {
    intervalMs: parseInt(process.env.RATE_LIMIT_INTERVAL_MS) || 60000,
    requestsPerInterval: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_INTERVAL) || 100,
  },
  services: {
    source: {
      sendEventsIntervalMs: parseInt(process.env.SOURCE_SERVICE_SEND_EVENTS_INTERVAL_MS) || 1500,
      testUserCredentials: process.env.SOURCE_SERVICE_TEST_USER_CREDENTIALS || '',
      testUsersData: process.env.SOURCE_SERVICE_TEST_USERS_DATA || '',
    },
    target: {
      graphqlUrl: process.env.TARGET_SERVICE_GRAPHQL_URL || 'http://localhost:4001/graphql',
      requestRetries: parseInt(process.env.TARGET_SERVICE_REQUEST_RETRIES) || 0,
      rateLimit: {
        intervalMs: parseInt(process.env.TARGET_SERVICE_RATE_LIMIT_INTERVAL_MS) || 3000,
        requestsPerInterval: parseInt(process.env.TARGET_SERVICE_RATE_LIMIT_REQUESTS_PER_INTERVAL) || 1,
      },
    },
  },
};

const logger: Logger = new Logger('Environment');
logger.log(JSON.stringify(environment, null, 2));
