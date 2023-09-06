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

  /**
   * Calles while module initialization and runs adding test users to repository process
   */
  async onModuleInit(): Promise<void> {
    await this.fillUsers();
  }

  /**
   * Adds test users to repository if they are not exist there
   */
  private async fillUsers(): Promise<void> {
    const proxyServiceConfig: ProxyServiceConfig = this.configService.get<ServicesConfig>('services').proxy;
    if (proxyServiceConfig.testUsersData) {
      const entities: User[] = JSON.parse(proxyServiceConfig.testUsersData);
      const existingEntities: User[] = await this.userRepository.getUsersByIds(
        entities.map((item: User) => item.id),
      );
      const existingEntitityIds: string[] = existingEntities.map((item: User) => item.id);
      const entitiesToCreate: User[] = entities.filter(
        (item: User) => !existingEntitityIds.includes(item.id),
      );
      if (entitiesToCreate.length > 0) {
        await this.userRepository.createUsers(entitiesToCreate);
      }
    }
  }
}
