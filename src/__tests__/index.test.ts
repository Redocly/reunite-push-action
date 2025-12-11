/**
 * Unit tests for the action's entrypoint, src/index.ts
 */

import { describe, vi, it, expect } from 'vitest';
import * as main from '../main';

vi.mock('../main', { spy: true });

// Mock the action's entrypoint
const runMock = vi.mocked(main.run).mockImplementation(vi.fn());

describe('index', () => {
  it('calls run when imported', async () => {
    await import('../index');

    expect(runMock).toHaveBeenCalled();
  });
});
