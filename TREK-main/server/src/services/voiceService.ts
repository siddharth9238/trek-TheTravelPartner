import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { VoiceCommand, VoiceResponse } from '@trek/shared';

@Injectable()
export class VoiceService {
  private readonly logger = new Logger(VoiceService.name);
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  isConfigured(): boolean {
    return this.genAI !== null;
  }

  async processVoiceCommand(dto: VoiceCommand): Promise<VoiceResponse> {
    if (!this.genAI) {
      return {
        success: false,
        message: 'AI assistant is not configured for voice commands.',
      };
    }

    try {
      // FIX: Added generationConfig to enforce pure JSON output and strip Markdown tags
      const model = this.genAI.getGenerativeModel({ 
        model: 'gemini-3.1-flash-lite',
        generationConfig: {
          responseMimeType: 'application/json',
        }
      });

      const prompt = `You are TREK's Voice Assistant. Process this voice command and return a JSON response.

Command: "${dto.text}"

Analyze the command and determine:
1. What action the user wants
2. Any entities (trip name, destination, date, etc.)
3. What should be updated

Return JSON format exactly like this:
{
  "success": true,
  "action": "create_trip|update_itinerary|add_place|search_flights|search_hotels|unknown",
  "data": { /* extracted data */ },
  "message": "Human-readable confirmation message"
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      try {
        // Because of the responseMimeType, responseText will now be pure JSON
        const parsed: VoiceResponse = JSON.parse(responseText);
        return parsed;
      } catch {
        // This fallback should rarely, if ever, trigger now
        return {
          success: true,
          message: 'Voice command processed, but could not parse response. ' + responseText,
          action: 'chat',
          data: { rawResponse: responseText },
        };
      }
    } catch (error: any) {
      console.log("API Key exists?:", !!process.env.GEMINI_API_KEY);
      console.log("Detailed Google Error:", error.response?.data ? JSON.stringify(error.response.data, null, 2) : error.message);
      this.logger.error('Voice command processing failed', error);
      
      if (error.message?.includes('400')) {
        throw new HttpException(
          { error: 'Invalid request to AI service. Check model name and API key.' },
          HttpStatus.BAD_REQUEST,
        );
      }
      
      return {
        success: false,
        message: 'Failed to process voice command.',
      };
    }
  }
}