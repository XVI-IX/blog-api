import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';
import { CreateUserDto } from './dto';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @Public()
  register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @Post('/verify')
  @Public()
  @HttpCode(200)
  verify(@Body() dto: { token: string; email: string }) {
    return this.authService.verifyAccount(dto.token, dto.email);
  }
}
