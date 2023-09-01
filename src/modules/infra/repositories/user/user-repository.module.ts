import { Module } from '@nestjs/common';
import { USER_REPOSITORY_TOKEN } from './constants';
import { UserInMemoryRepository } from './repositories';
import { UsersAutoFillService } from './services';

@Module({
  providers: [
    UsersAutoFillService,
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: UserInMemoryRepository,
    },
  ],
  exports: [USER_REPOSITORY_TOKEN],
})
export class UserRepositoryModule {}
