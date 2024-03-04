import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostgresModule } from 'src/postgres/postgres.module';

@Module({
  controllers: [PostsController],
  providers: [PostsService],
  imports: [PostgresModule],
})
export class PostsModule {}
