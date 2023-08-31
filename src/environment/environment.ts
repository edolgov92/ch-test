import { Logger } from '@nestjs/common';
import * as fs from 'fs';

const data: { name: string; description: string; version: string } = JSON.parse(
  fs.readFileSync('package.json').toString(),
);

export const environment = {
  port: process.env.PORT || 4000,
  api: {
    name: data.name,
    description: data.description,
    version: data.version,
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  },
};

const logger: Logger = new Logger('Environment');
logger.log(JSON.stringify(environment, null, 2));
