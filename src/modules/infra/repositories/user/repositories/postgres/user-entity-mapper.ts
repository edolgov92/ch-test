import { cloneJson, User, UserSession } from '../../../../../common';
import { UserPostgresModel, UserSessionPostgresModel } from './models';

export class UserEntityMapper {
  static toUserDomainEntity(postgresEntity: UserPostgresModel): User {
    return new User(cloneJson(postgresEntity.dataValues));
  }

  static toUserDomainEntities(postgresEntities: UserPostgresModel[]): User[] {
    return postgresEntities.map((item: UserPostgresModel) => UserEntityMapper.toUserDomainEntity(item));
  }

  static toUserSessionDomainEntity(postgresEntity: UserSessionPostgresModel): UserSession {
    return new UserSession(cloneJson(postgresEntity.dataValues));
  }

  static toUserSessionPostgresEntity(entity: UserSession): UserSessionPostgresModel {
    return new UserSessionPostgresModel(entity);
  }
}
