import { Body, Controller, Get, Post, Res, UseGuards, Req, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AiService } from '../../services/aiService';
import { AiChatRequest, AiItineraryRequest, AiPackingRequest, AiExpenseAnalysisRequest, AiDestinationRequest, AiTripSummaryRequest, AiImageRequest, AnalyticsFilter, FlightResult } from '@trek/shared';

interface GeminiResponse {
  candidates?: {
    content: {
      parts: { text: string }[];
    };
  }[];
}

// FIX: Changed from 'api/ai' to 'ai' to prevent double /api/api routing prefix
@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('status')
  getStatus() {
    return { configured: this.aiService.isConfigured() };
  }

  @Post('chat')
  async chatStreaming(
    @Body() body: AiChatRequest,
    @CurrentUser() user: { id: number },
    @Res() res: Response,
    @Req() req: Request,
  ) {
    if (!this.aiService.isConfigured()) {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({ 
        error: 'AI assistant is not configured' 
      });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

    const onClose = () => {};

    req.on('close', onClose);

    try {
      const stream = this.aiService.streamChatWithTimeout(user.id, body, 15000);
      
      for await (const chunk of stream) {
        if (res.writableEnded) {
          break;
        }
        res.write(`data: ${JSON.stringify({ content: chunk, type: 'content' })}\n\n`);
      }

      if (!res.writableEnded) {
        res.write('event: done\ndata: [DONE]\n\n');
        res.end();
      }
    } catch (error: any) {
      if (!res.writableEnded) {
        if (error.message?.includes('timeout')) {
          res.status(HttpStatus.REQUEST_TIMEOUT).json({ 
            error: 'Request timed out',
            message: 'The AI service took too long to respond. Please try again.'
          });
        } else {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
            error: 'AI service error',
            message: error.message 
          });
        }
      }
    } finally {
      req.off('close', onClose);
    }
  }

  @Post('chat/blocking')
  async chatBlocking(
    @Body() body: AiChatRequest,
    @CurrentUser() user: { id: number },
  ) {
    if (!this.aiService.isConfigured()) {
      return { error: 'AI assistant is not configured' };
    }

    const tripContext = body.tripId ? await this.aiService.getTripContext(body.tripId) : null;
    const systemPrompt = this.aiService.buildSystemPrompt(tripContext);

    const contents = [
      ...(body.history || []).map(h => ({ 
        role: h.role === 'user' ? 'user' : 'model', 
        parts: [{ text: h.content }] 
      })),
      { role: 'user', parts: [{ text: body.message }] },
    ];

    const payload = {
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: { maxOutputTokens: 2000, temperature: 0.7 },
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`${this.aiService['geminiBaseUrl']}?key=${this.aiService['apiKey']}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json() as GeminiResponse;
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return { response: text };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return { error: 'Request timed out. Please try again.' };
      }
      return { error: error.message || 'Failed to get response' };
    }
  }

  @Post('itinerary')
  async generateItinerary(
    @Body() body: AiItineraryRequest,
    @CurrentUser() user: { id: number },
  ) {
    if (!this.aiService.isConfigured()) {
      return { error: 'AI assistant is not configured' };
    }
    return this.aiService.generateItinerary(body);
  }

  @Post('packing')
  async generatePackingList(@Body() body: AiPackingRequest) {
    if (!this.aiService.isConfigured()) {
      return { error: 'AI assistant is not configured' };
    }
    return this.aiService.generatePackingList(body);
  }

  @Post('analyze-expenses')
  async analyzeExpenses(@Body() body: AiExpenseAnalysisRequest) {
    if (!this.aiService.isConfigured()) {
      return { error: 'AI assistant is not configured' };
    }
    return this.aiService.analyzeExpenses(body);
  }

  @Post('recommend-destinations')
  async recommendDestinations(@Body() body: AiDestinationRequest) {
    if (!this.aiService.isConfigured()) {
      return { error: 'AI assistant is not configured' };
    }
    return this.aiService.recommendDestinations(body);
  }

  @Post('trip-summary')
  async generateTripSummary(@Body() body: AiTripSummaryRequest) {
    if (!this.aiService.isConfigured()) {
      return { error: 'AI assistant is not configured' };
    }
    return this.aiService.generateTripSummary(body);
  }

  @Post('generate-image')
  async generateTripPoster(@Body() body: AiImageRequest) {
    if (!this.aiService.isConfigured()) {
      return { error: 'AI assistant is not configured' };
    }
    return this.aiService.generateTripPoster(body);
  }

  @Post('analytics')
  async getAnalytics(@Body() filter: AnalyticsFilter, @CurrentUser() user: { id: number }) {
    if (!this.aiService.isConfigured()) {
      return { error: 'AI assistant is not configured' };
    }
    return this.aiService.getAnalytics(user.id, filter);
  }

  @Post('recommend-flight')
  async recommendFlight(@Body() body: { flights: FlightResult[]; preference?: string }) {
    if (!this.aiService.isConfigured()) {
      return { error: 'AI assistant is not configured' };
    }
    return this.aiService.recommendFlight(body.flights, body.preference);
  }
}