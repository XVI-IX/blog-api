import { Controller, HttpCode, Get, ParseIntPipe, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from 'src/common/decorators/user.decorator';
import { Payload } from 'src/common/entities/payload.entity';

@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/me')
  @HttpCode(200)
  profile(@User() user: Payload) {
    return this.usersService.profile(user.email);
  }

  @Get()
  @HttpCode(200)
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Get('/:id')
  @HttpCode(200)
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserById(id);
  }
}
