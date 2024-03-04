import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { PostgresModule } from '../postgres/postgres.module';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService],
  imports: [PostgresModule],
})
export class CategoriesModule {}
