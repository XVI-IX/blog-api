import { Controller } from '@nestjs/common';
import { PostgresService } from './postgres.service';

@Controller('postgres')
export class PostgresController {
  constructor(private readonly postgresService: PostgresService) {}
}
