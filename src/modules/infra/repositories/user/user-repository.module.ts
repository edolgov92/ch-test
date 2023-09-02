import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment, RepositoriesConfig, RepositoryConfig } from '../../../../environment';
import { connectToPostgres, RepositoryType } from '../../../common';
import { USER_REPOSITORY_TOKEN } from './constants';
import {
  UserInMemoryRepository,
  UserPostgresModel,
  UserPostgresRepository,
  UserSessionPostgresModel,
} from './repositories';
import { UsersAutoFillService } from './services';

const logger: Logger = new Logger('UserRepositoryModule');

@Module({
  providers: [
    UsersAutoFillService,
    {
      inject: [ConfigService],
      provide: USER_REPOSITORY_TOKEN,
      useFactory: async (configService: ConfigService<Environment>) => {
        const userRepositoryConfig: RepositoryConfig =
          configService.get<RepositoriesConfig>('repositories').user;
        if (userRepositoryConfig.type === RepositoryType.Postgres) {
          await connectToPostgres(
            userRepositoryConfig.url,
            [UserPostgresModel, UserSessionPostgresModel],
            logger,
          );
          return new UserPostgresRepository();
        } else {
          return new UserInMemoryRepository();
        }
      },
    },
  ],
  exports: [USER_REPOSITORY_TOKEN],
})
export class UserRepositoryModule {}
