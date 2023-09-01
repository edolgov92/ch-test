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

  async getUserSessionByRefreshToken(refreshToken: any): Promise<UserSession | undefined> {
    return this.userSessionEntities.find((item: UserSession) => item.refreshToken === refreshToken);
  }

  async saveUsers(entities: User[]): Promise<void> {
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

  async saveUserSession(entity: UserSession): Promise<void> {
    const existingEntity: UserSession | undefined = this.userSessionEntities.find(
      (item: UserSession) => item === entity || item.id === entity.id,
    );
    if (existingEntity) {
      if (entity !== existingEntity) {
        Object.assign(existingEntity, entity);
      }
    } else {
      this.userSessionEntities.push(entity);
    }
  }
}
