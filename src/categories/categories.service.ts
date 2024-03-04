import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PostgresService } from '../postgres/postgres.service';
import { CreateCategoryDto } from './dto';

@Injectable()
export class CategoriesService {
  constructor(private pg: PostgresService) {}

  async getCategories() {
    try {
      const categories = await this.pg.query(`SELECT * FROM Categories`);

      if (!categories) {
        throw new InternalServerErrorException(
          'Categories could not be retrieved',
        );
      }

      return {
        message: 'Categories retrieved',
        status: 'success',
        statusCode: 200,
        data: categories,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async addCategories(dto: CreateCategoryDto) {
    try {
      const category = await this.pg.query(
        `INSERT INTO Categories (name) VALUES ($1)`,
        [dto.name],
      );

      if (!category) {
        throw new InternalServerErrorException(
          'Categories could not be retrieved',
        );
      }

      return {
        message: 'Category Created successfully',
        status: 'success',
        statusCode: 200,
        data: category,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
