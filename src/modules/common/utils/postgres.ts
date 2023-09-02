import { Logger } from '@nestjs/common';
import { ModelCtor, Sequelize } from 'sequelize-typescript';
import { PostgresParams } from '../interfaces';
import { sleep } from './date-time';

export function extractPostgresParams(connectionString: string, logger: Logger): PostgresParams | undefined {
  try {
    const url: URL = new URL(connectionString);
    const pathnameParts: string[] = url.pathname.split('.');
    return {
      host: url.hostname,
      port: parseInt(url.port),
      username: url.username,
      password: url.password,
      database: pathnameParts[0].slice(1),
      schema: pathnameParts[1] || undefined,
    };
  } catch (ex) {
    logger.error(`Failed to extract postgres params from connection string: ${connectionString}`);
  }
  return undefined;
}

export async function connectToPostgres(
  connectionString: string,
  models: string[] | ModelCtor[],
  logger: Logger,
): Promise<void> {
  const params: PostgresParams | undefined = extractPostgresParams(connectionString, logger);
  if (!params) {
    throw new Error('Failed to initialize connection, not able to parse connection string');
  }
  const sequelize: Sequelize = new Sequelize({
    ...params,
    dialect: 'postgres',
    models,
  });
  let initialized: boolean = false;
  let error: any;
  let count: number = 0;
  while (!initialized || count < 30) {
    try {
      await sequelize.sync();
      initialized = true;
      break;
    } catch (ex) {
      logger.verbose('DB connection attempt failed');
      error = ex;
      await sleep(100);
      count++;
    }
  }
  if (initialized) {
    logger.debug('DB connected successfully');
  } else {
    logger.error('Unable to connect to the database:', error);
    throw error;
  }
}
