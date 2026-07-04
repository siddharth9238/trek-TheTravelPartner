import { Module } from '@nestjs/common';
import { VoiceController } from './voice.controller';
import { VoiceService } from '../../services/voiceService';
import { AiModule } from '../ai/ai.module';

@Module({
  controllers: [VoiceController],
  providers: [VoiceService],
  imports: [AiModule],
})
export class VoiceModule {}