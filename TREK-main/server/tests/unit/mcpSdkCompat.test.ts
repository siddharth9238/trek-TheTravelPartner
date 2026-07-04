import { describe, expect, it } from 'vitest';

describe('MCP SDK compatibility imports', () => {
  it('loads the OAuth provider module without failing on auth subpath resolution', async () => {
    await expect(import('../../src/mcp/oauthProvider')).resolves.toBeDefined();
  });
});
