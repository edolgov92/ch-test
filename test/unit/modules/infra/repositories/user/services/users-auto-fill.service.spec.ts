import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Environment } from '../../../../../../../src/environment';
import { User, USER_REPOSITORY_TOKEN, UserRepository } from '../../../../../../../src/modules';
import { UsersAutoFillService } from '../../../../../../../src/modules/infra/repositories/user/services';

const USERS: User[] = [
  {
    id: 'usr_5Qv1ARJMWJnD1hTdbNgiQf',
    authId: 'source_user',
    secret: '$2b$10$59D08dqnE0NS7J09QjjdjuJAuIkEhyv35u00oWDFT1d2aqQFHjrRm',
  },
];

describe('UsersAutoFillService', () => {
  let configService: Partial<ConfigService<Environment>>;
  let userRepository: Partial<UserRepository>;
  let usersAutoFillService: UsersAutoFillService;

  beforeEach(async () => {
    configService = {
      get: jest.fn().mockReturnValue({
        proxy: {
          testUsersData: JSON.stringify(USERS),
        },
      }),
    };

    userRepository = {
      getUsersByIds: jest.fn().mockResolvedValue([]),
      createUsers: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersAutoFillService,
        {
          provide: ConfigService,
          useValue: configService,
        },
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: userRepository,
        },
      ],
    }).compile();

    usersAutoFillService = module.get<UsersAutoFillService>(UsersAutoFillService);
  });

  it('should populate users if they do not already exist', async () => {
    await usersAutoFillService.onModuleInit();
    expect(userRepository.getUsersByIds).toHaveBeenCalledWith([USERS[0].id]);
    expect(userRepository.createUsers).toHaveBeenCalledWith(USERS);
  });

  it('should not populate users if they already exist', async () => {
    userRepository.getUsersByIds = jest.fn().mockResolvedValue(USERS);
    await usersAutoFillService.onModuleInit();
    expect(userRepository.getUsersByIds).toHaveBeenCalledWith([USERS[0].id]);
    expect(userRepository.createUsers).not.toHaveBeenCalled();
  });
});
