import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import type { User } from '../../types';
import { HealthService } from './health.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';

const echoSchema = z.object({ name: z.string().min(1) });

/**
 * Foundation smoke endpoints.
 * Path: /api/_nest/health
 */
@Controller('api/_nest/health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  // This is now reached at: GET /api/_nest/health
  @Get() 
  getHealth() {
    return { ok: true, ...this.healthService.info() };
  }

  // This is now reached at: GET /api/_nest/health/me
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: User) {
    return user;
  }

  // This is now reached at: POST /api/_nest/health/echo
  @Post('echo')
  @UseGuards(JwtAuthGuard)
  echo(@Body(new ZodValidationPipe(echoSchema)) body: z.infer<typeof echoSchema>) {
    return { youSent: body };
  }
}

/**
 * Root health check for Render.
 * Path: /healthz
 */
@Controller()
export class RootHealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('healthz')
  healthCheck() {
    return this.healthService.info();
  }
}