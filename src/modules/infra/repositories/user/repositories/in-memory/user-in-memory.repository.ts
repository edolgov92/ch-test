import { User, UserSession } from '../../../../../common';
import { UserRepository } from '../../interfaces';

export class UserInMemoryRepository implements UserRepository {
  private userEntities: User[] = [];
  private userSessionEntities: UserSession[] = [];

  async getUserByAuthId(authId: string): Promise<User | undefined> {
    return this.userEntities.find((item: User) => item.authId === authId);
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.userEntities.find((item: User) => item.id === id);
  }

  async getUsersByIds(ids: string[]): Promise<User[]> {
    return this.userEntities.filter((item: User) => ids.includes(item.id));
  }

  async getUserSessionByRefreshToken(refreshToken: any): Promise<UserSession | undefined> {
    return this.userSessionEntities.find((item: UserSession) => item.refreshToken === refreshToken);
  }

  async createUsers(entities: User[]): Promise<void> {
    entities.forEach((entity: User) => {
      const existingEntity: User | undefined = this.userEntities.find(
        (item: User) => item === entity || item.id === entity.id,
      );
      if (existingEntity) {
        if (entity !== existingEntity) {
          Object.assign(existingEntity, entity);
        }
      } else {
        this.userEntities.push(entity);
      }
    });
  }

  async createUserSession(entity: UserSession): Promise<void> {
    const existingEntity: UserSession | undefined = this.userSessionEntities.find(
      (item: UserSession) => item === entity || item.id === entity.id,
    );
    if (existingEntity) {
      throw new Error('User session with the same id already exist');
    }
    this.userSessionEntities.push(entity);
  }

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
