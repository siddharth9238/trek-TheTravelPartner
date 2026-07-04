import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { VoiceService } from '../../services/voiceService';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { VoiceCommand, VoiceResponse } from '@trek/shared';

@Controller('api/voice')
@UseGuards(JwtAuthGuard)
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  @Post('command')
  async processCommand(@Body() dto: VoiceCommand): Promise<VoiceResponse> {
    return this.voiceService.processVoiceCommand(dto);
  }
}