import { ModelStatic } from 'sequelize';
import { User, UserSession } from '../../../../../common';
import { UserRepository } from '../../interfaces';
import { UserPostgresModel, UserSessionPostgresModel } from './models';
import { UserEntityMapper } from './user-entity-mapper';

export class UserPostgresRepository implements UserRepository {
  protected mapper: typeof UserEntityMapper = UserEntityMapper;
  protected userModel: ModelStatic<UserPostgresModel> = UserPostgresModel;
  protected userSessionModel: ModelStatic<UserSessionPostgresModel> = UserSessionPostgresModel;

  async getUserByAuthId(authId: string): Promise<User | undefined> {
    const postgresEntity: UserPostgresModel | null = await this.userModel.findOne({ where: { authId } });
    return postgresEntity ? this.mapper.toUserDomainEntity(postgresEntity) : undefined;
  }

  async getUserById(id: string): Promise<User> {
    const postgresEntity: UserPostgresModel | null = await this.userModel.findOne({ where: { id } });
    return postgresEntity ? this.mapper.toUserDomainEntity(postgresEntity) : undefined;
  }

  async getUsersByIds(ids: string[]): Promise<User[]> {
    const postgresEntities: UserPostgresModel[] = await this.userModel.findAll({ where: { id: ids } });
    return this.mapper.toUserDomainEntities(postgresEntities);
  }

  async getUserSessionByRefreshToken(refreshToken: string): Promise<UserSession> {
    const postgresEntity: UserSessionPostgresModel | null = await this.userSessionModel.findOne({
      where: { refreshToken },
    });
    return postgresEntity ? this.mapper.toUserSessionDomainEntity(postgresEntity) : undefined;
  }

  async createUsers(entities: User[]): Promise<void> {
    await this.userModel.bulkCreate(entities);
  }

  async createUserSession(entity: UserSession): Promise<void> {
    await this.userSessionModel.create(entity);
  }

  async updateUserSession(entity: UserSession, update: Partial<UserSession>): Promise<void> {
    await this.userSessionModel.update(update, { where: { id: entity.id } });
  }
}
