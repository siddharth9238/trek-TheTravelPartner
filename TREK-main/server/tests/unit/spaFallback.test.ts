import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { PUBLIC_DIR } from '../../src/nest/platform/platform.routes';
import { shouldServeSpaFallback } from '../../src/nest/platform/spa-fallback.filter';

describe('SPA fallback asset resolution', () => {
  it('uses the built client dist directory when the frontend bundle exists', () => {
    const repoRoot = path.resolve(__dirname, '../../..');
    const expected = path.join(repoRoot, 'client', 'dist');

    expect(fs.existsSync(path.join(expected, 'index.html'))).toBe(true);
    expect(PUBLIC_DIR).toBe(expected);
  });

  it('serves the built client for GET requests even when NODE_ENV is development', () => {
    expect(shouldServeSpaFallback('GET', 'development')).toBe(true);
    expect(shouldServeSpaFallback('POST', 'development')).toBe(false);
  });
});
