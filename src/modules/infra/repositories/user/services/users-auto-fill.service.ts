import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment, ProxyServiceConfig, ServicesConfig } from '../../../../../environment';
import { User } from '../../../../common';
import { USER_REPOSITORY_TOKEN } from '../constants';
import { UserRepository } from '../interfaces';

@Injectable()
export class UsersAutoFillService {
  constructor(
    private configService: ConfigService<Environment>,
    @Inject(USER_REPOSITORY_TOKEN) private userRepository: UserRepository,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.fillUsers();
  }

  private async fillUsers(): Promise<void> {
    const proxyServiceConfig: ProxyServiceConfig = this.configService.get<ServicesConfig>('services').proxy;
    if (proxyServiceConfig.testUsersData) {
      const entities: User[] = JSON.parse(proxyServiceConfig.testUsersData);
      await this.userRepository.saveUsers(entities);
    }
  }
}
