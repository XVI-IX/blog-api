import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PostgresModule } from '../postgres/postgres.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [PostgresModule],
})
export class UsersModule {}
