import { User, UserSession } from '../../../../../common';
import { UserRepository } from '../../interfaces';
import { UserPostgresModel, UserSessionPostgresModel } from './models';
import { UserEntityMapper } from './user-entity-mapper';

export class UserPostgresRepository implements UserRepository {
  async getUserByAuthId(authId: string): Promise<User | undefined> {
    const postgresEntity: UserPostgresModel | null = await UserPostgresModel.findOne({ where: { authId } });
    return postgresEntity ? UserEntityMapper.toUserDomainEntity(postgresEntity) : undefined;
  }

  async getUserById(id: string): Promise<User> {
    const postgresEntity: UserPostgresModel | null = await UserPostgresModel.findOne({ where: { id } });
    return postgresEntity ? UserEntityMapper.toUserDomainEntity(postgresEntity) : undefined;
  }

  async getUsersByIds(ids: string[]): Promise<User[]> {
    const postgresEntities: UserPostgresModel[] = await UserPostgresModel.findAll({ where: { id: ids } });
    return UserEntityMapper.toUserDomainEntities(postgresEntities);
  }

  async getUserSessionByRefreshToken(refreshToken: string): Promise<UserSession> {
    const postgresEntity: UserSessionPostgresModel | null = await UserSessionPostgresModel.findOne({
      where: { refreshToken },
    });
    return postgresEntity ? UserEntityMapper.toUserSessionDomainEntity(postgresEntity) : undefined;
  }

  async createUsers(entities: User[]): Promise<void> {
    await UserPostgresModel.bulkCreate(entities);
  }

  async createUserSession(entity: UserSession): Promise<void> {
    const postgresEntity: UserSessionPostgresModel = UserEntityMapper.toUserSessionPostgresEntity(entity);
    await postgresEntity.save();
  }

  async updateUserSession(entity: UserSession, update: Partial<UserSession>): Promise<void> {
    await UserSessionPostgresModel.update(update, { where: { id: entity.id } });
  }
}
