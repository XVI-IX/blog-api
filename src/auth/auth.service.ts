import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto, LoginDto } from './dto';
import * as argon from 'argon2';
import { apiResponse } from '../common/types';
import { randomBytes } from 'crypto';
import { PostgresService } from '../postgres/postgres.service';
import * as moment from 'moment';
import { Payload } from 'src/common/entities/payload.entity';
import { config } from 'src/common/config/config.env';

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

  async login(dto: LoginDto) {
    try {
      const user = await this.pg.getUser(dto.email);

      if (!user.verified) {
        const verificationToken = randomBytes(3).toString('hex');
        const query =
          'UPDATE Users SET vertoken = $1, updated_at = NOW() WHERE id = &2';
        const values = [verificationToken, user.id];

        await this.pg.query(query, values);

        // SEND Email

        return {
          message: 'Please verify your email',
          status: 'success',
          statusCode: 200,
        };
      }

      const match = await argon.verify(user.password, dto.password);

      if (!match) {
        throw new UnauthorizedException('Invalid Password');
      }

      const payload: Payload = {
        sub: user.id,
        username: user.username,
        email: user.email,
        roles: [user.role],
      };

      const token = await this.jwt.signAsync(payload, {
        secret: config.JWT_SECRET,
      });

      return {
        access_token: token,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async forgotPassword(user_email: string) {
    try {
      const reset_token = randomBytes(16).toString('hex');
      const reset_token_exp = new Date(Date.now() + 1000 * 60 * 60 * 24);
      const query = `UPDATE users SET reset_token = $1, reset_token_exp = $2 WHERE email = $3`;
      const values = [reset_token, reset_token_exp, user_email];

      const user = await this.pg.query(query, values);
      console.log(user);

      if (!user) {
        throw new InternalServerErrorException('Reset token could not be set');
      }

      return {
        message: 'Reset token sent to your email',
        status: 'success',
        statusCode: 200,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async resetPassword(user_email: string, token: string, password: string) {
    try {
      const query = 'SELECT * FROM Users WHERE email = $1';
      const values = [user_email];

      const user = await this.pg.query(query, values);
      const expired = moment(user.verExp).isBefore(Date.now());

      if (user.reset_token !== token && expired) {
        throw new InternalServerErrorException('Password could not be reset');
      }

      await this.pg.changePassword(user.id, password);

      return {
        message: 'Password reset',
        status: 'success',
        statusCode: 200,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
