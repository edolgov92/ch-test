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
    target: {
      graphqlUrl: process.env.TARGET_SERVICE_GRAPHQL_URL || 'http://localhost:4001/graphql',
      requestRetries: parseInt(process.env.TARGET_SERVICE_REQUEST_RETRIES) || 1,
      rateLimit: {
        intervalMs: parseInt(process.env.TARGET_SERVICE_RATE_LIMIT_INTERVAL_MS) || 3000,
        requestsPerInterval: parseInt(process.env.TARGET_SERVICE_RATE_LIMIT_REQUESTS_PER_INTERVAL) || 1,
      },
    },
  },
};

const logger: Logger = new Logger('Environment');
logger.log(JSON.stringify(environment, null, 2));
