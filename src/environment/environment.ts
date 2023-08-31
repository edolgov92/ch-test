import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as shortUUID from 'short-uuid';
import { QueueType } from '../modules/common/enums';

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
    type: (process.env.QUEUE_TYPE as QueueType) || '',
    url: process.env.QUEUE_URL || '',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  },
};

const logger: Logger = new Logger('Environment');
logger.log(JSON.stringify(environment, null, 2));
