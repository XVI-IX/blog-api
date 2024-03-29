import {
  Controller,
  HttpCode,
  Get,
  ParseIntPipe,
  Param,
  Put,
  Body,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../common/decorators/user.decorator';
import { Payload } from '../common/entities/payload.entity';
import { UpdateUserDto } from './dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

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
  @Roles(Role.admin)
  @HttpCode(200)
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Get('/:id')
  @HttpCode(200)
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserById(id);
  }

  @Put('/:id')
  @HttpCode(200)
  updateUserById(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, dto);
  }

  @Delete('/:id')
  @HttpCode(200)
  deleteUser(@Param('id', ParseIntPipe) id: number, @User() user: Payload) {
    return this.usersService.deleteUser(id, user);
  }
}
