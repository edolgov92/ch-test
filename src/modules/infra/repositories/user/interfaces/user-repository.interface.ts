import { User, UserSession } from '../../../../common';

export interface UserRepository {
  getUserByAuthId(authId: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUsersByIds(ids: string[]): Promise<User[]>;
  getUserSessionByRefreshToken(refreshToken: string): Promise<UserSession | undefined>;
  createUsers(entities: User[]): Promise<void>;
  createUserSession(entity: UserSession): Promise<void>;
  updateUserSession(entity: UserSession, update: Partial<UserSession>): Promise<void>;
}
