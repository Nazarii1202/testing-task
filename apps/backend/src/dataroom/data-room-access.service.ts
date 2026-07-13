import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const PDF_MIME_TYPE = 'application/pdf';
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

@Injectable()
export class DataRoomAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async assertDataRoomOwnership(
    dataRoomId: string,
    userId: string,
  ): Promise<void> {
    const dataRoom = await this.prisma.dataRoom.findFirst({
      where: { id: dataRoomId, ownerId: userId },
      select: { id: true },
    });

    if (!dataRoom) {
      throw new NotFoundException('Data room not found');
    }
  }

  async assertFolderInDataRoom(
    dataRoomId: string,
    folderId: string,
  ): Promise<void> {
    const folder = await this.prisma.folder.findFirst({
      where: { id: folderId, dataRoomId },
      select: { id: true },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }
  }

  async assertFileInDataRoom(
    dataRoomId: string,
    fileId: string,
  ): Promise<void> {
    const file = await this.prisma.file.findFirst({
      where: { id: fileId, dataRoomId },
      select: { id: true },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }
  }

  async assertUniqueFolderName(
    dataRoomId: string,
    name: string,
    parentFolderId: string | null,
    excludeFolderId?: string,
  ): Promise<void> {
    const existing = await this.prisma.folder.findFirst({
      where: {
        dataRoomId,
        parentFolderId,
        name: { equals: name, mode: 'insensitive' },
        ...(excludeFolderId ? { NOT: { id: excludeFolderId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException(
        'A folder with this name already exists in this location',
      );
    }
  }

  async assertUniqueFileName(
    dataRoomId: string,
    name: string,
    folderId: string | null,
    excludeFileId?: string,
  ): Promise<void> {
    const existing = await this.prisma.file.findFirst({
      where: {
        dataRoomId,
        folderId,
        name: { equals: name, mode: 'insensitive' },
        ...(excludeFileId ? { NOT: { id: excludeFileId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException(
        'A file with this name already exists in this location',
      );
    }
  }

  validatePdfUpload(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('A PDF file is required');
    }

    if (file.mimetype !== PDF_MIME_TYPE) {
      throw new BadRequestException('Only PDF files are supported');
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException('File size must be 10 MB or less');
    }
  }

  resolveUniqueName(baseName: string, existingNames: string[]): string {
    const normalizedExisting = new Set(
      existingNames.map((name) => name.toLowerCase()),
    );

    if (!normalizedExisting.has(baseName.toLowerCase())) {
      return baseName;
    }

    const extensionMatch = baseName.match(/^(.*)(\.pdf)$/i);
    const stem = extensionMatch ? extensionMatch[1] : baseName;
    const extension = extensionMatch ? extensionMatch[2] : '';

    let counter = 1;
    let candidate = `${stem} (${counter})${extension}`;

    while (normalizedExisting.has(candidate.toLowerCase())) {
      counter += 1;
      candidate = `${stem} (${counter})${extension}`;
    }

    return candidate;
  }
}
