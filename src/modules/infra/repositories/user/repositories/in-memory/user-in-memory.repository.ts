import { User, UserSession } from '../../../../../common';
import { UserRepository } from '../../interfaces';

export class UserInMemoryRepository implements UserRepository {
  private userEntities: User[] = [];
  private userSessionEntities: UserSession[] = [];

  /**
   * Returns user entity by authId from storage
   * @param {String} authId - user's authId
   * @returns {User | undefined} - user entity
   */
  async getUserByAuthId(authId: string): Promise<User | undefined> {
    return this.userEntities.find((item: User) => item.authId === authId);
  }

  /**
   * Returns user entity by id from storage
   * @param {String} id - user's id
   * @returns {User | undefined} - user entity
   */
  async getUserById(id: string): Promise<User | undefined> {
    return this.userEntities.find((item: User) => item.id === id);
  }

  /**
   * Returns users entities by ids from storage
   * @param {String[]} ids - user's ids
   * @returns {User[]} - users entities list
   */
  async getUsersByIds(ids: string[]): Promise<User[]> {
    return this.userEntities.filter((item: User) => ids.includes(item.id));
  }

  /**
   * Returns user session entity by refresh token from storage
   * @param {String} refreshToken - refresh token
   * @returns {UserSession | undefined} - user session entity
   */
  async getUserSessionByRefreshToken(refreshToken: string): Promise<UserSession | undefined> {
    return this.userSessionEntities.find((item: UserSession) => item.refreshToken === refreshToken);
  }

  /**
   * Creates users in repository
   * @param {User[]} entities - users entities list
   */
  async createUsers(entities: User[]): Promise<void> {
    entities.forEach((entity: User) => {
      const existingEntity: User | undefined = this.userEntities.find(
        (item: User) => item === entity || item.id === entity.id,
      );
      if (existingEntity) {
        throw new Error('User with the same id already exist');
      }
      this.userEntities.push(entity);
    });
  }

  /**
   * Creates user session in repository
   * @param {UserSession} entity - user session entity
   */
  async createUserSession(entity: UserSession): Promise<void> {
    const existingEntity: UserSession | undefined = this.userSessionEntities.find(
      (item: UserSession) => item === entity || item.id === entity.id,
    );
    if (existingEntity) {
      throw new Error('User session with the same id already exist');
    }
    this.userSessionEntities.push(entity);
  }

  /**
   * Updates user session in repository
   * @param {UserSession} entity - user session entity
   * @param {Partial<UserSession>} update - object with user session updated values
   */
  async updateUserSession(entity: UserSession, update: Partial<UserSession>): Promise<void> {
    const existingEntity: UserSession | undefined = this.userSessionEntities.find(
      (item: UserSession) => item === entity || item.id === entity.id,
    );
    if (existingEntity) {
      Object.assign(existingEntity, update);
    } else {
      throw new Error('User session not found in repository');
    }
  }
}
