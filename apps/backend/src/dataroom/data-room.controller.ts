import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { memoryStorage } from 'multer';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../auth/decorators/current-user.decorator';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { DataRoomService } from './data-room.service';
import {
  CreateDataRoomDto,
  CreateFolderDto,
  UpdateDataRoomDto,
  UpdateFileDto,
  UpdateFolderDto,
} from './dto/data-room.dto';
import {
  DataRoomContentsDto,
  DataRoomSummaryDto,
  FileItemDto,
  FolderItemDto,
} from './dto/data-room-response.dto';

@ApiTags('Data Rooms')
@ApiBearerAuth('access-token')
@Controller('data-rooms')
export class DataRoomController {
  constructor(private readonly dataRoomService: DataRoomService) {}

  @Get()
  @ApiOperation({ summary: 'List data rooms for the current user' })
  @ApiOkResponse({ type: [DataRoomSummaryDto] })
  listDataRooms(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DataRoomSummaryDto[]> {
    return this.dataRoomService.listDataRooms(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new data room' })
  @ApiCreatedResponse({ type: DataRoomSummaryDto })
  createDataRoom(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateDataRoomDto,
  ): Promise<DataRoomSummaryDto> {
    return this.dataRoomService.createDataRoom(user.id, dto);
  }

  @Patch(':dataRoomId')
  @ApiOperation({ summary: 'Rename a data room' })
  @ApiOkResponse({ type: DataRoomSummaryDto })
  updateDataRoom(
    @Param('dataRoomId') dataRoomId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateDataRoomDto,
  ): Promise<DataRoomSummaryDto> {
    return this.dataRoomService.updateDataRoom(dataRoomId, user.id, dto);
  }

  @Delete(':dataRoomId')
  @ApiOperation({ summary: 'Delete a data room and all nested content' })
  @ApiNoContentResponse({ description: 'Data room deleted' })
  async deleteDataRoom(
    @Param('dataRoomId') dataRoomId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.dataRoomService.deleteDataRoom(dataRoomId, user.id);
  }

  @Get(':dataRoomId/contents')
  @ApiOperation({ summary: 'List folders and files in a data room location' })
  @ApiQuery({
    name: 'folderId',
    required: false,
    description: 'Folder to browse. Omit for data room root.',
  })
  @ApiOkResponse({ type: DataRoomContentsDto })
  getContents(
    @Param('dataRoomId') dataRoomId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query('folderId') folderId?: string,
  ): Promise<DataRoomContentsDto> {
    return this.dataRoomService.getContents(dataRoomId, user.id, folderId);
  }

  @Post(':dataRoomId/folders')
  @ApiOperation({ summary: 'Create a folder' })
  @ApiCreatedResponse({ type: FolderItemDto })
  createFolder(
    @Param('dataRoomId') dataRoomId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateFolderDto,
  ): Promise<FolderItemDto> {
    return this.dataRoomService.createFolder(dataRoomId, user.id, dto);
  }

  @Patch(':dataRoomId/folders/:folderId')
  @ApiOperation({ summary: 'Rename a folder' })
  @ApiOkResponse({ type: FolderItemDto })
  updateFolder(
    @Param('dataRoomId') dataRoomId: string,
    @Param('folderId') folderId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateFolderDto,
  ): Promise<FolderItemDto> {
    return this.dataRoomService.updateFolder(
      dataRoomId,
      folderId,
      user.id,
      dto,
    );
  }

  @Delete(':dataRoomId/folders/:folderId')
  @ApiOperation({ summary: 'Delete a folder and nested content' })
  @ApiNoContentResponse({ description: 'Folder deleted' })
  async deleteFolder(
    @Param('dataRoomId') dataRoomId: string,
    @Param('folderId') folderId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.dataRoomService.deleteFolder(dataRoomId, folderId, user.id);
  }

  @Post(':dataRoomId/files')
  @ApiOperation({ summary: 'Upload a PDF file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
        folderId: { type: 'string', nullable: true },
      },
    },
  })
  @ApiCreatedResponse({ type: FileItemDto })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  uploadFile(
    @Param('dataRoomId') dataRoomId: string,
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
    @Body('folderId') folderId?: string,
  ): Promise<FileItemDto> {
    return this.dataRoomService.uploadFile(
      dataRoomId,
      user.id,
      file,
      folderId || undefined,
    );
  }

  @Get(':dataRoomId/files/:fileId')
  @ApiOperation({ summary: 'View or download a PDF file' })
  @ApiOkResponse({ description: 'PDF file stream' })
  async getFile(
    @Param('dataRoomId') dataRoomId: string,
    @Param('fileId') fileId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Res() res: Response,
  ): Promise<void> {
    const file = await this.dataRoomService.getFileContent(
      dataRoomId,
      fileId,
      user.id,
    );

    res.setHeader('Content-Type', file.mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(file.name)}"`,
    );
    res.send(file.content);
  }

  @Patch(':dataRoomId/files/:fileId')
  @ApiOperation({ summary: 'Rename a file' })
  @ApiOkResponse({ type: FileItemDto })
  updateFile(
    @Param('dataRoomId') dataRoomId: string,
    @Param('fileId') fileId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateFileDto,
  ): Promise<FileItemDto> {
    return this.dataRoomService.updateFile(dataRoomId, fileId, user.id, dto);
  }

  @Delete(':dataRoomId/files/:fileId')
  @ApiOperation({ summary: 'Delete a file' })
  @ApiNoContentResponse({ description: 'File deleted' })
  async deleteFile(
    @Param('dataRoomId') dataRoomId: string,
    @Param('fileId') fileId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.dataRoomService.deleteFile(dataRoomId, fileId, user.id);
  }
}
