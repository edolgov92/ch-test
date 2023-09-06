import { ModelStatic } from 'sequelize';
import { User, UserSession } from '../../../../../common';
import { UserRepository } from '../../interfaces';
import { UserPostgresModel, UserSessionPostgresModel } from './models';
import { UserEntityMapper } from './user-entity-mapper';

export class UserPostgresRepository implements UserRepository {
  protected mapper: typeof UserEntityMapper = UserEntityMapper;
  protected userModel: ModelStatic<UserPostgresModel> = UserPostgresModel;
  protected userSessionModel: ModelStatic<UserSessionPostgresModel> = UserSessionPostgresModel;

  /**
   * Returns user entity by authId from storage
   * @param {String} authId - user's authId
   * @returns {User | undefined} - user entity
   */
  async getUserByAuthId(authId: string): Promise<User | undefined> {
    const postgresEntity: UserPostgresModel | null = await this.userModel.findOne({ where: { authId } });
    return postgresEntity ? this.mapper.toUserDomainEntity(postgresEntity) : undefined;
  }

  /**
   * Returns user entity by id from storage
   * @param {String} id - user's id
   * @returns {User | undefined} - user entity
   */
  async getUserById(id: string): Promise<User> {
    const postgresEntity: UserPostgresModel | null = await this.userModel.findOne({ where: { id } });
    return postgresEntity ? this.mapper.toUserDomainEntity(postgresEntity) : undefined;
  }

  /**
   * Returns users entities by ids from storage
   * @param {String[]} ids - user's ids
   * @returns {User[]} - users entities list
   */
  async getUsersByIds(ids: string[]): Promise<User[]> {
    const postgresEntities: UserPostgresModel[] = await this.userModel.findAll({ where: { id: ids } });
    return this.mapper.toUserDomainEntities(postgresEntities);
  }

  /**
   * Returns user session entity by refresh token from storage
   * @param {String} refreshToken - refresh token
   * @returns {UserSession | undefined} - user session entity
   */
  async getUserSessionByRefreshToken(refreshToken: string): Promise<UserSession> {
    const postgresEntity: UserSessionPostgresModel | null = await this.userSessionModel.findOne({
      where: { refreshToken },
    });
    return postgresEntity ? this.mapper.toUserSessionDomainEntity(postgresEntity) : undefined;
  }

  /**
   * Creates users in repository
   * @param {User[]} entities - users entities list
   */
  async createUsers(entities: User[]): Promise<void> {
    await this.userModel.bulkCreate(entities);
  }

  /**
   * Creates user session in repository
   * @param {UserSession} entity - user session entity
   */
  async createUserSession(entity: UserSession): Promise<void> {
    await this.userSessionModel.create(entity);
  }

  /**
   * Updates user session in repository
   * @param {UserSession} entity - user session entity
   * @param {Partial<UserSession>} update - object with user session updated values
   */
  async updateUserSession(entity: UserSession, update: Partial<UserSession>): Promise<void> {
    await this.userSessionModel.update(update, { where: { id: entity.id } });
  }
}
