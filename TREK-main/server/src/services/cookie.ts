import { Request, Response } from 'express';
import { SESSION_DURATION_MS, SESSION_DURATION_REMEMBER_MS } from '../config';

const COOKIE_NAME = 'trek_session';

/**
 * Controls the cookie lifetime for a login:
 *  - `undefined` → persistent `maxAge: SESSION_DURATION_MS` (the historical
 *    default, used by register/demo and anything that doesn't opt in).
 *  - `true`  → persistent `maxAge: SESSION_DURATION_REMEMBER_MS` ("Remember me").
 *  - `false` → no `maxAge` — a browser-session cookie cleared on browser close.
 */
export type RememberOption = boolean | undefined;

export function cookieOptions(clear = false, req?: Request, remember?: RememberOption) {
  // FIX: We bypass all the environment checks and force 'secure' to true 
  // because sameSite: 'none' will be instantly rejected by browsers if secure is false.
  return buildOptions(clear, true, remember);
}

function resolveMaxAge(remember: RememberOption): { maxAge: number } | Record<string, never> {
  // false → session cookie (omit maxAge); true → the longer "remember me"
  // window; undefined → the historical default. Each maxAge matches the JWT exp.
  if (remember === false) return {};
  if (remember === true) return { maxAge: SESSION_DURATION_REMEMBER_MS };
  return { maxAge: SESSION_DURATION_MS };
}

function buildOptions(clear: boolean, secure: boolean, remember?: RememberOption) {
  return {
    httpOnly: true,
    secure: true,              // <-- FIX: Forced to true for cross-domain support
    sameSite: 'none' as const, // <-- FIX: Changed from 'lax' to 'none' so Vercel/Render frontend can use it
    path: '/',
    ...(clear ? {} : resolveMaxAge(remember)),
  };
}

export function setAuthCookie(res: Response, token: string, req?: Request, remember?: RememberOption): void {
  res.cookie(COOKIE_NAME, token, cookieOptions(false, req, remember));
}

export function clearAuthCookie(res: Response, req?: Request): void {
  res.clearCookie(COOKIE_NAME, cookieOptions(true, req));
}