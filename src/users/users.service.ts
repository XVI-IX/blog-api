import { Injectable } from '@nestjs/common';
import { PostgresService } from '../postgres/postgres.service';

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
}
