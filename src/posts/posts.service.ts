import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PostgresService } from '../postgres/postgres.service';
import { AddPostDto, CommentDto, UpdatePostDto } from './dto';
import { Payload } from '../common/entities/payload.entity';
import { config } from '../common/config/config.env';

@Injectable()
export class PostsService {
  constructor(private pg: PostgresService) {}

  async addPost(user: Payload, dto: AddPostDto) {
    try {
      let category = await this.pg.query(
        `SELECT * FROM categories WHERE name = $1`,
        [dto.category],
      );

      if (category.length === 0) {
        category = await this.pg.query(
          `INSERT INTO Categories (name) VALUES ($1) RETURNING *`,
          [dto.category],
        );
        if (!category) {
          throw new InternalServerErrorException(
            'New Category could not be created',
          );
        }
      }

      const query = `
      INSERT INTO Posts (title, content, category_id, user_id)
      VALUES ($1, $2, $3, $4) RETURNING *
      `;
      const values = [dto.title, dto.content, category[0].id, user.sub];

      const post = await this.pg.query(query, values);

      if (!post) {
        throw new InternalServerErrorException('Post could not be created');
      }

      const userQuery = `
      UPDATE Users SET posts = array_append(Posts, $1)
      WHERE id = $2 RETURNING *
      `;
      const userValue = [JSON.stringify(post[0]), user.sub];

      const userResult = await this.pg.query(userQuery, userValue);

      if (!userResult) {
        throw new InternalServerErrorException('Post could not be added');
      }

      return {
        message: 'Post added successfully',
        status: 'success',
        statusCode: 200,
        data: {
          username: userResult[0].username,
          posts: userResult[0].posts,
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

      if (post.length === 0) {
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

      console.log(posts);

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
      let category = await this.pg.query(
        `SELECT * FROM categories WHERE name = $1`,
        [dto.category],
      );

      if (category.length === 0) {
        category = await this.pg.query(
          `INSERT INTO Categories (name) VALUES ($1) RETURNING *`,
          [dto.category],
        );
        if (!category) {
          throw new InternalServerErrorException(
            'New Category could not be created',
          );
        }
      }

      const post = await this.pg.query(
        `UPDATE Posts SET 
        title = $1, content = $2, updated_at = NOW(), category_id = $3
        WHERE id = $4 RETURNING *`,
        [dto.title, dto.content, category[0].id, post_id],
      );

      if (!post) {
        throw new InternalServerErrorException('Post could not be updated');
      }

      return {
        message: 'Post updated',
        status: 'success',
        statusCode: 200,
        data: post[0],
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
        link: `${config.API_LINK}/posts/${post_id}`,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async likePost(post_id: number, user: Payload) {
    try {
      const query = `UPDATE Posts SET likes = likes + 1, liked_by = array_append(liked_by, $1) WHERE id = $2 RETURNING *`;
      const values = [user.sub, post_id];

      const liked = await this.pg.query(query, values);

      if (!liked) {
        throw new InternalServerErrorException('Post could not be liked.');
      }

      return {
        message: 'Post liked.',
        status: 'success',
        statusCode: 200,
        data: {
          id: liked[0].id,
          likes: liked[0].liked,
          liked_by: liked[0].liked_by,
        },
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async commentPost(post_id: number, user: Payload, dto: CommentDto) {
    try {
      const query = `
      INSERT INTO Comments (content, user_id, post_id) VALUES ($1, $2, $3) RETURNING *
      `;
      const values = [dto.content, user.sub, post_id];

      const comment = await this.pg.query(query, values);

      if (!comment) {
        throw new InternalServerErrorException('comment could not be posted');
      }

      return {
        message: 'Comment posted',
        status: 'success',
        statusCode: 200,
        data: comment[0],
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getComments(post_id: number) {
    try {
      const comments = await this.pg.query(
        'SELECT * FROM Comments WHERE post_id = $1',
        [post_id],
      );

      console.log(comments);

      if (!comments) {
        throw new InternalServerErrorException('Post could not be retrieved');
      }
      if (comments[0].length === 0) {
        throw new NotFoundException('Post comments could not be retrieved');
      }

      return {
        message: 'comments retrieved',
        status: 'success',
        statusCode: 200,
        data: comments,
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
