import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DataRoomAccessService } from './data-room-access.service';
import {
  CreateDataRoomDto,
  CreateFolderDto,
  UpdateDataRoomDto,
  UpdateFileDto,
  UpdateFolderDto,
} from './dto/data-room.dto';
import {
  BreadcrumbDto,
  DataRoomContentsDto,
  DataRoomSummaryDto,
  FileItemDto,
  FolderItemDto,
} from './dto/data-room-response.dto';

@Injectable()
export class DataRoomService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: DataRoomAccessService,
  ) {}

  async listDataRooms(userId: string): Promise<DataRoomSummaryDto[]> {
    return this.prisma.dataRoom.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async createDataRoom(
    userId: string,
    dto: CreateDataRoomDto,
  ): Promise<DataRoomSummaryDto> {
    return this.prisma.dataRoom.create({
      data: {
        name: dto.name.trim(),
        ownerId: userId,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateDataRoom(
    dataRoomId: string,
    userId: string,
    dto: UpdateDataRoomDto,
  ): Promise<DataRoomSummaryDto> {
    await this.access.assertDataRoomOwnership(dataRoomId, userId);

    return this.prisma.dataRoom.update({
      where: { id: dataRoomId },
      data: { name: dto.name.trim() },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteDataRoom(dataRoomId: string, userId: string): Promise<void> {
    await this.access.assertDataRoomOwnership(dataRoomId, userId);
    await this.prisma.dataRoom.delete({ where: { id: dataRoomId } });
  }

  async getContents(
    dataRoomId: string,
    userId: string,
    folderId?: string,
  ): Promise<DataRoomContentsDto> {
    await this.access.assertDataRoomOwnership(dataRoomId, userId);

    const dataRoom = await this.prisma.dataRoom.findUniqueOrThrow({
      where: { id: dataRoomId },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const currentFolderId = folderId ?? null;

    if (currentFolderId) {
      await this.access.assertFolderInDataRoom(dataRoomId, currentFolderId);
    }

    const [folders, files, breadcrumbs] = await Promise.all([
      this.prisma.folder.findMany({
        where: {
          dataRoomId,
          parentFolderId: currentFolderId,
        },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          parentFolderId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.file.findMany({
        where: {
          dataRoomId,
          folderId: currentFolderId,
        },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          mimeType: true,
          size: true,
          folderId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.buildBreadcrumbs(dataRoomId, currentFolderId, dataRoom.name),
    ]);

    return {
      dataRoom,
      breadcrumbs,
      folders,
      files,
    };
  }

  async createFolder(
    dataRoomId: string,
    userId: string,
    dto: CreateFolderDto,
  ): Promise<FolderItemDto> {
    await this.access.assertDataRoomOwnership(dataRoomId, userId);

    const parentFolderId = dto.parentFolderId ?? null;

    if (parentFolderId) {
      await this.access.assertFolderInDataRoom(dataRoomId, parentFolderId);
    }

    const trimmedName = dto.name.trim();
    await this.access.assertUniqueFolderName(
      dataRoomId,
      trimmedName,
      parentFolderId,
    );

    return this.prisma.folder.create({
      data: {
        name: trimmedName,
        dataRoomId,
        parentFolderId,
      },
      select: {
        id: true,
        name: true,
        parentFolderId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateFolder(
    dataRoomId: string,
    folderId: string,
    userId: string,
    dto: UpdateFolderDto,
  ): Promise<FolderItemDto> {
    await this.access.assertDataRoomOwnership(dataRoomId, userId);
    await this.access.assertFolderInDataRoom(dataRoomId, folderId);

    const folder = await this.prisma.folder.findUniqueOrThrow({
      where: { id: folderId },
      select: { parentFolderId: true },
    });

    const trimmedName = dto.name.trim();
    await this.access.assertUniqueFolderName(
      dataRoomId,
      trimmedName,
      folder.parentFolderId,
      folderId,
    );

    return this.prisma.folder.update({
      where: { id: folderId },
      data: { name: trimmedName },
      select: {
        id: true,
        name: true,
        parentFolderId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteFolder(
    dataRoomId: string,
    folderId: string,
    userId: string,
  ): Promise<void> {
    await this.access.assertDataRoomOwnership(dataRoomId, userId);
    await this.access.assertFolderInDataRoom(dataRoomId, folderId);
    await this.prisma.folder.delete({ where: { id: folderId } });
  }

  async uploadFile(
    dataRoomId: string,
    userId: string,
    file: Express.Multer.File,
    folderId?: string,
  ): Promise<FileItemDto> {
    await this.access.assertDataRoomOwnership(dataRoomId, userId);
    this.access.validatePdfUpload(file);

    const targetFolderId = folderId ?? null;

    if (targetFolderId) {
      await this.access.assertFolderInDataRoom(dataRoomId, targetFolderId);
    }

    const existingFiles = await this.prisma.file.findMany({
      where: { dataRoomId, folderId: targetFolderId },
      select: { name: true },
    });

    const resolvedName = this.access.resolveUniqueName(
      file.originalname.trim(),
      existingFiles.map((entry) => entry.name),
    );

    return this.prisma.file.create({
      data: {
        name: resolvedName,
        mimeType: file.mimetype,
        size: file.size,
        content: new Uint8Array(file.buffer),
        dataRoomId,
        folderId: targetFolderId,
      },
      select: {
        id: true,
        name: true,
        mimeType: true,
        size: true,
        folderId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getFileContent(
    dataRoomId: string,
    fileId: string,
    userId: string,
  ): Promise<{ name: string; mimeType: string; content: Buffer }> {
    await this.access.assertDataRoomOwnership(dataRoomId, userId);
    await this.access.assertFileInDataRoom(dataRoomId, fileId);

    const file = await this.prisma.file.findUniqueOrThrow({
      where: { id: fileId },
      select: {
        name: true,
        mimeType: true,
        content: true,
      },
    });

    return {
      name: file.name,
      mimeType: file.mimeType,
      content: Buffer.from(file.content),
    };
  }

  async updateFile(
    dataRoomId: string,
    fileId: string,
    userId: string,
    dto: UpdateFileDto,
  ): Promise<FileItemDto> {
    await this.access.assertDataRoomOwnership(dataRoomId, userId);
    await this.access.assertFileInDataRoom(dataRoomId, fileId);

    const file = await this.prisma.file.findUniqueOrThrow({
      where: { id: fileId },
      select: { folderId: true },
    });

    const trimmedName = dto.name.trim();
    await this.access.assertUniqueFileName(
      dataRoomId,
      trimmedName,
      file.folderId,
      fileId,
    );

    return this.prisma.file.update({
      where: { id: fileId },
      data: { name: trimmedName },
      select: {
        id: true,
        name: true,
        mimeType: true,
        size: true,
        folderId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteFile(
    dataRoomId: string,
    fileId: string,
    userId: string,
  ): Promise<void> {
    await this.access.assertDataRoomOwnership(dataRoomId, userId);
    await this.access.assertFileInDataRoom(dataRoomId, fileId);
    await this.prisma.file.delete({ where: { id: fileId } });
  }

  private async buildBreadcrumbs(
    dataRoomId: string,
    folderId: string | null,
    dataRoomName: string,
  ): Promise<BreadcrumbDto[]> {
    const breadcrumbs: BreadcrumbDto[] = [{ id: null, name: dataRoomName }];

    if (!folderId) {
      return breadcrumbs;
    }

    const trail: BreadcrumbDto[] = [];
    let currentFolderId: string | null = folderId;

    while (currentFolderId) {
      const folder = await this.prisma.folder.findFirst({
        where: { id: currentFolderId, dataRoomId },
        select: {
          id: true,
          name: true,
          parentFolderId: true,
        },
      });

      if (!folder) {
        break;
      }

      trail.unshift({ id: folder.id, name: folder.name });
      currentFolderId = folder.parentFolderId;
    }

    return [...breadcrumbs, ...trail];
  }
}
