import { User, UserSession } from '../../../../common';

export interface UserRepository {
  getUserByAuthId(authId: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserSessionByRefreshToken(refreshToken: string): Promise<UserSession | undefined>;
  saveUsers(entities: User[]): Promise<void>;
  saveUserSession(entity: UserSession): Promise<void>;
}
