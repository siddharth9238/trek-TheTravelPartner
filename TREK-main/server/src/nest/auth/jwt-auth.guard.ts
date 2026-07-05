import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { extractToken, verifyJwtAndLoadUser } from '../../middleware/auth';

/**
 * Validates TREK's existing JWT session.
 * Includes an OPTIONS request bypass to allow CORS preflight requests 
 * to pass through without authentication.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();

    // FIX: Allow CORS preflight requests to pass through automatically.
    // The browser sends an OPTIONS request before the real POST/GET request.
    if (req.method === 'OPTIONS') {
      return true;
    }

    const token = extractToken(req);
    if (!token) {
      throw new HttpException({ error: 'Access token required', code: 'AUTH_REQUIRED' }, 401);
    }

    const user = verifyJwtAndLoadUser(token);
    if (!user) {
      throw new HttpException({ error: 'Invalid or expired token', code: 'AUTH_REQUIRED' }, 401);
    }

    req.user = user;
    return true;
  }
}
