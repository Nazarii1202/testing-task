import { Module } from '@nestjs/common';
import { DataRoomAccessService } from './data-room-access.service';
import { DataRoomController } from './data-room.controller';
import { DataRoomService } from './data-room.service';

@Module({
  controllers: [DataRoomController],
  providers: [DataRoomService, DataRoomAccessService],
})
export class DataRoomModule {}
