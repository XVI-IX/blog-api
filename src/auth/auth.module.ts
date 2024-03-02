import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PostgresModule } from 'src/postgres/postgres.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [JwtModule, PostgresModule],
})
export class AuthModule {}
