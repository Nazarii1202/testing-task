import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DataRoomSummaryDto {
  @ApiProperty({ example: 'clx123abc' })
  id: string;

  @ApiProperty({ example: 'Acquisition Due Diligence' })
  name: string;

  @ApiProperty({ example: '2026-07-11T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-11T12:00:00.000Z' })
  updatedAt: Date;
}

export class FolderItemDto {
  @ApiProperty({ example: 'clx456def' })
  id: string;

  @ApiProperty({ example: 'Financial Statements' })
  name: string;

  @ApiPropertyOptional({ example: 'clx123abc', nullable: true })
  parentFolderId: string | null;

  @ApiProperty({ example: '2026-07-11T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-11T12:00:00.000Z' })
  updatedAt: Date;
}

export class FileItemDto {
  @ApiProperty({ example: 'clx789ghi' })
  id: string;

  @ApiProperty({ example: 'Term Sheet.pdf' })
  name: string;

  @ApiProperty({ example: 'application/pdf' })
  mimeType: string;

  @ApiProperty({ example: 102400 })
  size: number;

  @ApiPropertyOptional({ example: 'clx456def', nullable: true })
  folderId: string | null;

  @ApiProperty({ example: '2026-07-11T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-11T12:00:00.000Z' })
  updatedAt: Date;
}

export class BreadcrumbDto {
  @ApiPropertyOptional({ example: 'clx456def', nullable: true })
  id: string | null;

  @ApiProperty({ example: 'Financial Statements' })
  name: string;
}

export class DataRoomContentsDto {
  @ApiProperty({ type: DataRoomSummaryDto })
  dataRoom: DataRoomSummaryDto;

  @ApiProperty({ type: [BreadcrumbDto] })
  breadcrumbs: BreadcrumbDto[];

  @ApiProperty({ type: [FolderItemDto] })
  folders: FolderItemDto[];

  @ApiProperty({ type: [FileItemDto] })
  files: FileItemDto[];
}
