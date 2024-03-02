import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn((dto) => {
      return {
        message:
          'Account created successfully, verify account with otp sent to mail',
        status: 'success',
        statusCode: 201,
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    })
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a user', () => {
    expect(
      controller.register({
        username: 'oxdd',
        email: 'testmail@example.com',
        password: 'test_Password',
        role: 'reader',
      }),
    ).toEqual({
      message: expect.stringMatching(
        'Account created successfully, verify account with otp sent to mail',
      ),
      status: expect.stringMatching('success'),
      statusCode: expect.any(Number),
    });
  });
});
