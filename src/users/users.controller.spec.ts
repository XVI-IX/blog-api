import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUserService = {
    profile: jest.fn(),
    getAllUsers: jest.fn(),
    getUsersById: jest.fn(),
    updateUser: jest.fn(),
    changeRole: jest.fn(),
    deleteRole: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    })
      .overrideProvider(UsersService)
      .useValue(mockUserService)
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return profile', () => {
    expect(
      controller.profile({
        sub: 1,
        username: 'username',
        roles: ['admin'],
        email: 'email',
      }),
    ).toEqual({
      message: expect.stringMatching('User data retrieved'),
      status: expect.stringMatching('success'),
      statusCode: expect.any(Number),
      data: expect.any(Object),
    });
  });
});
