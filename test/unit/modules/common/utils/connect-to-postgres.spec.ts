import { Logger } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { connectToPostgres } from '../../../../../src/modules/common';

jest.mock('sequelize-typescript');
const mockSequelize = Sequelize as jest.MockedClass<typeof Sequelize>;

class MockLogger implements Partial<Logger> {
  verbose = jest.fn();
  debug = jest.fn();
  error = jest.fn();
}

const CONNECTION_STRING: string = 'postgres://username:password@localhost:5432/database.schema';

describe('connectToPostgres', () => {
  let logger: Partial<Logger>;

  beforeEach(() => {
    logger = new MockLogger();
  });

  it('successfully connects to the database', async () => {
    mockSequelize.prototype.sync = jest.fn().mockResolvedValueOnce(undefined);
    await connectToPostgres(CONNECTION_STRING, [], logger as Logger);
    expect(logger.debug).toHaveBeenCalledWith('DB connected successfully');
  });

  it('fails to connect to the database after retries', async () => {
    mockSequelize.prototype.sync = jest.fn().mockRejectedValue(new Error('DB error'));
    await expect(connectToPostgres(CONNECTION_STRING, [], logger as Logger)).rejects.toThrow();
    expect(logger.error).toHaveBeenCalledTimes(1);
  }, 10000);

  it('fails to parse connection string', async () => {
    await expect(connectToPostgres('connectionString', [], logger as Logger)).rejects.toThrow(
      'Failed to initialize connection, not able to parse connection string',
    );
  });
});
