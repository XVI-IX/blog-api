import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto';
import * as argon from 'argon2';
import { apiResponse } from 'src/common/types';
import { randomBytes } from 'crypto';
import { PostgresService } from 'src/postgres/postgres.service';

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private pg: PostgresService,
  ) {}

  async register(dto: CreateUserDto): Promise<apiResponse> {
    try {
      const user = await this.pg.addUser(dto);

      console.log(user);

      return {
        message:
          'Account created successfully, verify account with otp sent to mail',
        status: 'success',
        statusCode: 201,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
