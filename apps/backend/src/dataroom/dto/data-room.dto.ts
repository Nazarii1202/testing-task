import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateDataRoomDto {
  @ApiProperty({ example: 'Acquisition Due Diligence', minLength: 1, maxLength: 120 })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name: string;
}

export class UpdateDataRoomDto {
  @ApiProperty({ example: 'Q3 Acquisition Room', minLength: 1, maxLength: 120 })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name: string;
}

export class CreateFolderDto {
  @ApiProperty({ example: 'Financial Statements', minLength: 1, maxLength: 120 })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional({
    example: 'clx123abc',
    description: 'Parent folder ID. Omit for root-level folder.',
  })
  @IsOptional()
  @IsString()
  parentFolderId?: string;
}

export class UpdateFolderDto {
  @ApiProperty({ example: 'Updated Folder Name', minLength: 1, maxLength: 120 })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name: string;
}

export class UpdateFileDto {
  @ApiProperty({ example: 'Updated File.pdf', minLength: 1, maxLength: 255 })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;
}
