import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PostgresService } from '../postgres/postgres.service';
import { AddPostDto, UpdatePostDto } from './dto';
import { Payload } from '../common/entities/payload.entity';
import { config } from 'src/common/config/config.env';

@Injectable()
export class PostsService {
  constructor(private pg: PostgresService) {}

  async addPost(user: Payload, dto: AddPostDto) {
    try {
      const query = `
      INSERT INTO Posts (title, content, category_id, user_id)
      VALUES ($1, $2, $3, $4) RETURNING *
      `;
      const values = [dto.title, dto.content, dto.category_id, user.sub];

      const post = await this.pg.query(query, values);

      if (!post) {
        throw new InternalServerErrorException('Post could not be created');
      }

      const userQuery = `
      UPDATE Users SET posts = array_append(posts, $1)
      WHERE id = $2 RETURNING *
      `;
      const userValue = [JSON.stringify(post.rows[0]), user.sub];

      const userResult = await this.pg.query(userQuery, userValue);

      if (!userResult) {
        throw new InternalServerErrorException('Post could not be added');
      }

      return {
        message: 'Post added successfully',
        status: 'success',
        statusCode: 200,
        data: {
          username: userResult.username,
          posts: userResult.posts,
        },
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getUserPosts(user: Payload) {
    try {
      const posts = await this.pg.query(
        `SELECT * FROM Posts WHERE user_id = $1`,
        [user.sub],
      );

      if (!posts) {
        throw new InternalServerErrorException('Posts could not be retrieved');
      }

      return {
        message: 'Posts retrieved',
        status: 'success',
        statusCode: 200,
        data: posts,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getAllPosts() {
    try {
      const posts = await this.pg.query(`SELECT * FROM Posts;`);

      if (!posts) {
        throw new InternalServerErrorException('Posts could not be retrieved');
      }

      return {
        message: 'Posts retrieved',
        status: 'success',
        statusCode: 200,
        data: posts,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getPostById(postId: number) {
    try {
      const post = await this.pg.query(`SELECT * FROM Posts WHERE id = $1`, [
        postId,
      ]);

      if (post.rows.length === 0) {
        throw new NotFoundException('Post could not be found');
      }
      if (!post) {
        throw new InternalServerErrorException('Post could not be retrieved');
      }

      return {
        message: 'Post retrieved successfully',
        status: 'success',
        statusCode: 200,
        data: post,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async search(search: string) {
    try {
      const posts = await this.pg.query(
        `SELECT * FROM Posts
        WHERE
        to_tsvector(title) @@ to_tsquery($1)
        OR
        to_tsvector(content) @@ to_tsquery($1)`,
        [search],
      );

      if (!posts) {
        throw new InternalServerErrorException('Post could not be retrieved');
      }
      if (posts.length === 0) {
        throw new NotFoundException('Post not found');
      }

      return {
        message: 'Posts retrieved',
        status: 'success',
        statusCode: 200,
        data: posts,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async updatePost(post_id: number, dto: UpdatePostDto) {
    try {
      const post = await this.pg.query(
        `UPDATE Posts SET 
        title = $1, content = $1, updated_at = NOW()
        WHERE id = $3`,
        [dto.title, dto.content],
      );

      if (!post) {
        throw new InternalServerErrorException('Post could not be updated');
      }

      return {
        message: 'Post updated',
        status: 'success',
        statusCode: 200,
        data: post,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async sharePost(post_id: number) {
    try {
      const post = await this.pg.query(`SELECT * FROM Posts WHERE id = $1`, [
        post_id,
      ]);

      if (!post) {
        throw new InternalServerErrorException('Post could not be retrieved');
      }

      return {
        message: 'share link recieved',
        status: 'success',
        statusCode: 200,
        link: `${config.API_LINK}/posts/${post.id}`,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async deletePost(user: Payload, post_id: number) {
    try {
      const post = await this.pg.query(
        `DELETE FROM Posts WHERE id = $1 AND user_id = $2`,
        [post_id, user.sub],
      );

      if (!post) {
        throw new InternalServerErrorException('Post could not be deleted');
      }

      return {
        message: 'Post deleted',
        status: 'success',
        statusCode: 200,
      };
    } catch (error) {}
  }
}
