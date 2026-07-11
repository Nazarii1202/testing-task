import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HealthResponseDto } from './dto/health-response.dto';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async checkDatabaseConnection(): Promise<HealthResponseDto> {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok' };
  }
}
