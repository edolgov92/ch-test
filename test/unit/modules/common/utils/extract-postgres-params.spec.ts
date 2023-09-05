import { Logger } from '@nestjs/common';
import { extractPostgresParams, PostgresParams } from '../../../../../src/modules';

class MockLogger implements Partial<Logger> {
  error = jest.fn();
}

describe('extractPostgresParams', () => {
  let logger: Partial<Logger>;

  beforeEach(() => {
    logger = new MockLogger();
  });

  it('should correctly extract parameters from a valid connection string', () => {
    const connectionString: string = 'postgres://username:password@localhost:5432/database.schema';
    const params: PostgresParams = extractPostgresParams(connectionString, logger as Logger);

    expect(params).toEqual({
      host: 'localhost',
      port: 5432,
      username: 'username',
      password: 'password',
      database: 'database',
      schema: 'schema',
    });
  });

  it('should handle connection strings without a schema', () => {
    const connectionString: string = 'postgres://username:password@localhost:5432/database';
    const params: PostgresParams = extractPostgresParams(connectionString, logger as Logger);

    expect(params).toEqual({
      host: 'localhost',
      port: 5432,
      username: 'username',
      password: 'password',
      database: 'database',
      schema: undefined,
    });
  });

  it('should return undefined and log error for an invalid connection string', () => {
    const connectionString: string = 'invalid-string';
    const params: PostgresParams = extractPostgresParams(connectionString, logger as Logger);

    expect(params).toBeUndefined();
    expect(logger.error).toHaveBeenCalledTimes(1);
  });

  it('should return undefined for invalid URL format', () => {
    const connectionString: string = 'postgres:/username:password@localhost:5432/database';
    const params: PostgresParams = extractPostgresParams(connectionString, logger as Logger);

    expect(params).toBeUndefined();
    expect(logger.error).toHaveBeenCalledTimes(1);
  });

  it('should ignore extra pathname parts', () => {
    const connectionString: string = 'postgres://username:password@localhost:5432/database.schema.extra';
    const params: PostgresParams = extractPostgresParams(connectionString, logger as Logger);

    expect(params).toEqual({
      host: 'localhost',
      port: 5432,
      username: 'username',
      password: 'password',
      database: 'database',
      schema: 'schema',
    });
  });

  it('should return undefined for connection string without a hostname', () => {
    const connectionString: string = 'postgres://username:password@:5432/database';
    const params: PostgresParams = extractPostgresParams(connectionString, logger as Logger);

    expect(params).toBeUndefined();
    expect(logger.error).toHaveBeenCalledTimes(1);
  });
});
