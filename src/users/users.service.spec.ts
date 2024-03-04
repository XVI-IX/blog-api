import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PostgresService } from '../postgres/postgres.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockPostgresService = {
    query: jest.fn(),
    getUser: jest.fn(),
    getUserByToken: jest.fn(),
    addUser: jest.fn(),
    verifyUser: jest.fn(),
    changePassword: jest.fn(),
    changeRole: jest.fn(),
    deleteUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PostgresService],
    })
      .overrideProvider(PostgresService)
      .useValue(mockPostgresService)
      .compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
