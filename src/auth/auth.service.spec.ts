import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PostgresService } from '../postgres/postgres.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

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
      providers: [AuthService, PostgresService, JwtService],
    })
      .overrideProvider(PostgresService)
      .useValue(mockPostgresService)
      .overrideProvider(JwtService)
      .useValue(mockJwtService)
      .compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
