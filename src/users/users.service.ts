import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PostgresService } from '../postgres/postgres.service';
import { UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private pg: PostgresService) {}

  async profile(user_email: string) {
    try {
      const user = await this.pg.getUser(user_email);

      return {
        message: 'User data retrieved',
        status: 'success',
        statusCode: 200,
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          posts: user.posts,
        },
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getAllUsers() {
    try {
      const users = await this.pg.query(
        'SELECT id, username, role, posts FROM Users',
      );

      if (!users) {
        throw new InternalServerErrorException('Users could not be retrieved');
      }

      return {
        message: 'Users retrieved',
        status: 'success',
        statusCode: 200,
        data: users,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getUserById(id: number) {
    try {
      const user = await this.pg.query(
        'SELECT id, username, role, posts FROM Users WHERE id = $1',
        [id],
      );

      if (!user) {
        throw new InternalServerErrorException('User could not be retrieved');
      }

      return {
        message: 'User retrieved',
        status: 'success',
        statusCode: 200,
        data: user,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    try {
      const query = 'UPDATE Users SET username = $1 WHERE id = $2 RETURNING *';
      const values = [id, dto.username];

      const user = await this.pg.query(query, values);

      if (!user) {
        throw new InternalServerErrorException('User could not be updated');
      }

      return {
        message: 'User updated successfully',
        status: 'success',
        statusCode: 200,
        data: {
          username: user.username,
          email: user.email,
          posts: user.posts,
        },
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async changeRole(id: number, role: string) {
    try {
      const user = await this.pg.changeRole(id, role);

      return {
        message: 'User role changed successfully',
        status: 'success',
        statusCode: 200,
        data: {
          username: user.username,
          role: user.role,
        },
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async deleteUser(id: number) {
    try {
      await this.pg.deleteUser(id);

      return {
        message: 'User deleted',
        status: 'success',
        statusCode: 200,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
