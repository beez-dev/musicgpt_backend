import { Module } from '@nestjs/common';
import { AudioService } from './application/audio.service';
import { AudioController } from './interface/controllers/audio.controller';
import { AudioRepository } from './infrastructure/repository/audio.repository';

@Module({
  providers: [AudioService, AudioRepository],
  controllers: [AudioController],
})
export class AudioModule {}
