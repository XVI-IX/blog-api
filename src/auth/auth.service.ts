import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto';
import * as argon from 'argon2';
import { apiResponse } from '../common/types';
import { randomBytes } from 'crypto';
import { PostgresService } from '../postgres/postgres.service';
import * as moment from 'moment';

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private pg: PostgresService,
  ) {}

  async register(dto: CreateUserDto): Promise<apiResponse> {
    try {
      const user = await this.pg.addUser(dto);

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

  async verifyAccount(token: string, email: string) {
    try {
      const user = await this.pg.getUserByToken(token, email);

      if (moment(Date.now()).isAfter(user.verExp)) {
        throw new UnauthorizedException('Token Invalid');
      }
      const verify = await this.pg.verifyUser(user.id);

      return {
        message: 'account verified',
        status: 'success',
        statusCode: 200,
        data: {
          id: verify.id,
          username: verify.username,
          verified: verify.verified,
        },
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
