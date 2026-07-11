import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({
    example: 'ok',
    enum: ['ok'],
    description: 'Current health status of the dependency',
  })
  status: 'ok';
}
