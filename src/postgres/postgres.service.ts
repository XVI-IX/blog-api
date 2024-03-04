import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { CreateUserDto } from '../auth/dto';
import { config } from '../common/config/config.env';
import { randomBytes } from 'crypto';
import * as argon from 'argon2';
import { UserEntity } from '../common/entities/user.entity';

@Injectable()
export class PostgresService {
  private readonly pool: Pool;
  constructor() {
    try {
      this.pool = new Pool({
        connectionString: config.POSTGRES_LINK,
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Postgres connection failed please try again',
      );
    }
  }

  async query(text: string, values: any[] = []): Promise<any> {
    try {
      const result = await this.pool.query(text, values);
      return result.rows;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getUser(user_email: string): Promise<any> {
    const user_query = `SELECT * FROM users WHERE email = $1`;
    const user_values = [user_email];
    try {
      const rows = await this.pool.query(user_query, user_values);

      if (!rows.rows[0]) {
        throw new NotFoundException('User not found');
      }

      return rows.rows[0];
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getUserByToken(token: string, email: string): Promise<UserEntity> {
    const user_query = `SELECT * FROM users WHERE vertoken = $1 AND email = $2`;
    const user_values = [token, email];
    try {
      const rows = await this.pool.query(user_query, user_values);

      if (!rows.rows[0]) {
        throw new NotFoundException('User not found');
      }

      return rows.rows[0];
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async addUser(dto: CreateUserDto) {
    const password = await argon.hash(dto.password);
    const vertoken = randomBytes(3).toString('hex');
    const verExp = new Date(Date.now() + 1000 * 60 * 60 * 24);
    try {
      const query = `insert into Users (username, email, password, role, vertoken, verExp) values ($1, $2, $3, $4, $5, $6) returning *`;
      const values = [
        dto.username,
        dto.email,
        password,
        dto.role,
        vertoken,
        verExp,
      ];

      const result = await this.pool.query(query, values);

      if (!result) {
        throw new InternalServerErrorException('User could not be added.');
      }

      return result.rows[0];
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async verifyUser(user_id: number): Promise<UserEntity> {
    try {
      const query =
        'UPDATE Users SET verified = $1, vertoken = null, verExp = null, updated_at = NOW() WHERE id = $2 RETURNING *';
      const values = [true, user_id];

      const user = await this.pool.query(query, values);

      if (!user) {
        throw new InternalServerErrorException(
          'User role could not be changed',
        );
      }

      return user.rows[0];
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async changePassword(user_id: string, new_password: string) {
    try {
      const query =
        'UPDATE Users SET password = $1, updated_at = NOW() WHERE id = $2 RETURNING *';
      const values = [new_password, user_id];

      const result = await this.pool.query(query, values);

      if (!result) {
        throw new InternalServerErrorException('Password could not be updated');
      }

      return result.rows[0];
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async changeRole(user_id: number, new_role: string) {
    try {
      const query =
        'UPDATE Users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING *';
      const values = [new_role, user_id];
      const result = await this.pool.query(query, values);

      if (!result) {
        throw new InternalServerErrorException(
          'User role could not be updated',
        );
      }

      return result.rows[0];
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async deleteUser(user_id: number) {
    try {
      const query = 'DELETE FROM Users WHERE id = $1';
      const values = [user_id];

      const result = await this.pool.query(query, values);

      if (!result) {
        throw new InternalServerErrorException('User could not be deleted');
      }

      return true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
