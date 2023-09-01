import { Inject, Injectable } from '@nestjs/common';
import { environment } from '../../../../../environment';
import { User } from '../../../../common';
import { USER_REPOSITORY_TOKEN } from '../constants';
import { UserRepository } from '../interfaces';

@Injectable()
export class UsersAutoFillService {
  constructor(@Inject(USER_REPOSITORY_TOKEN) private userRepository: UserRepository) {
    this.fillUsers();
  }

  private async fillUsers(): Promise<void> {
    if (environment.services.source.testUsersData) {
      const entities: User[] = JSON.parse(environment.services.source.testUsersData);
      await this.userRepository.saveUsers(entities);
    }
  }
}
