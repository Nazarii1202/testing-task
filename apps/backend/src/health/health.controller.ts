import { Controller, Get } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { HealthResponseDto } from './dto/health-response.dto';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get('db')
  @ApiOperation({
    summary: 'Check database connectivity',
    description:
      'Verifies that the API can reach the PostgreSQL database through Prisma.',
  })
  @ApiOkResponse({
    description: 'Database connection is healthy',
    type: HealthResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Database connection failed',
    type: ErrorResponseDto,
  })
  checkDatabaseConnection(): Promise<HealthResponseDto> {
    return this.healthService.checkDatabaseConnection();
  }
}
