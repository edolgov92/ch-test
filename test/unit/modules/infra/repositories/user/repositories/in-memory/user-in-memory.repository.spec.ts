import { User, UserSession } from '../../../../../../../../src/modules';
import { UserInMemoryRepository } from '../../../../../../../../src/modules/infra/repositories/user/repositories';

const USERS: User[] = [
  { id: 'usr_1', authId: 'auth1', secret: 'secret1' },
  { id: 'usr_2', authId: 'auth2', secret: 'secret2' },
];
const USER_SESSIONS: UserSession[] = [
  {
    accessToken: 'accessToken1',
    accessTokenExpireDateTime: new Date(),
    id: 'uss_1',
    ipAddress: '127.0.0.1',
    refreshToken: 'refreshToken1',
    refreshTokenExpireDateTime: new Date(),
    startDateTime: new Date(),
    userId: USERS[0].id,
  },
  {
    accessToken: 'accessToken2',
    accessTokenExpireDateTime: new Date(),
    id: 'uss_2',
    ipAddress: '127.0.0.1',
    refreshToken: 'refreshToken2',
    refreshTokenExpireDateTime: new Date(),
    startDateTime: new Date(),
    userId: USERS[1].id,
  },
];

describe('UserInMemoryRepository', () => {
  let repository: UserInMemoryRepository;

  beforeEach(() => {
    repository = new UserInMemoryRepository();
    repository.createUsers(USERS);
    repository.createUserSession(USER_SESSIONS[0]);
    repository.createUserSession(USER_SESSIONS[1]);
  });

  describe('getUserByAuthId', () => {
    it('should return user by authId', async () => {
      const user: User | undefined = await repository.getUserByAuthId(USERS[0].authId);
      expect(user).toEqual(USERS[0]);
    });

    it('should return undefined if user not found', async () => {
      const user: User | undefined = await repository.getUserByAuthId('auth3');
      expect(user).toBeUndefined();
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const user: User | undefined = await repository.getUserById(USERS[0].id);
      expect(user).toEqual(USERS[0]);
    });

    it('should return undefined if user not found', async () => {
      const user: User | undefined = await repository.getUserById('3');
      expect(user).toBeUndefined();
    });
  });

  describe('getUsersByIds', () => {
    it('should return users by ids', async () => {
      const users: User[] = await repository.getUsersByIds(USERS.map((item: User) => item.id));
      expect(users).toEqual(USERS);
    });

    it('should return empty array if no users found', async () => {
      const users: User[] = await repository.getUsersByIds(['3', '4']);
      expect(users).toEqual([]);
    });
  });

  describe('getUserSessionByRefreshToken', () => {
    it('should return user session by refreshToken', async () => {
      const userSession: UserSession | undefined = await repository.getUserSessionByRefreshToken(
        USER_SESSIONS[0].refreshToken,
      );
      expect(userSession).toEqual(USER_SESSIONS[0]);
    });

    it('should return undefined if user session not found', async () => {
      const userSession: UserSession | undefined = await repository.getUserSessionByRefreshToken('refresh3');
      expect(userSession).toBeUndefined();
    });
  });

  describe('createUsers', () => {
    it('should create new users', async () => {
      const newUser: User = new User({ id: 'usr_3', authId: 'auth3', secret: 'secret3' });
      await repository.createUsers([newUser]);
      const user: User | undefined = await repository.getUserById(newUser.id);
      expect(user).toEqual(newUser);
    });

    it('should throw error if user with the same id already exist', async () => {
      await expect(repository.createUsers([USERS[0]])).rejects.toThrow('User with the same id already exist');
    });
  });

  describe('createUserSession', () => {
    it('should create new user session', async () => {
      const newUserSession: UserSession = new UserSession({
        accessToken: 'accessToken3',
        accessTokenExpireDateTime: new Date(),
        id: 'uss_3',
        ipAddress: '127.0.0.1',
        refreshToken: 'refreshToken3',
        refreshTokenExpireDateTime: new Date(),
        startDateTime: new Date(),
        userId: USERS[0].id,
      });
      await repository.createUserSession(newUserSession);
      const userSession: UserSession | undefined = await repository.getUserSessionByRefreshToken(
        newUserSession.refreshToken,
      );
      expect(userSession).toEqual(newUserSession);
    });

    it('should throw error if user session with the same id already exist', async () => {
      await expect(repository.createUserSession(USER_SESSIONS[0])).rejects.toThrow(
        'User session with the same id already exist',
      );
    });
  });

  describe('updateUserSession', () => {
    it('should update existing user session', async () => {
      const newRefreshTokenExpireDateTime: Date = new Date();
      await repository.updateUserSession(USER_SESSIONS[0], {
        refreshTokenExpireDateTime: newRefreshTokenExpireDateTime,
      });
      const userSession: UserSession = await repository.getUserSessionByRefreshToken(
        USER_SESSIONS[0].refreshToken,
      );
      expect(userSession.refreshTokenExpireDateTime).toEqual(newRefreshTokenExpireDateTime);
    });

    it('should throw error if user session not found', async () => {
      await expect(
        repository.updateUserSession({ ...USER_SESSIONS[0], id: 'newId' }, { refreshToken: 'newRefresh3' }),
      ).rejects.toThrow('User session not found in repository');
    });
  });
});
