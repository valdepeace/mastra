import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@mastra/core/vector', async importOriginal => {
  const actual = await importOriginal<typeof import('@mastra/core/vector')>();
  return {
    ...actual,
    embedV1: vi.fn().mockResolvedValue({ embedding: [0.1, 0.2] }),
    validateQueryInput: vi.fn(),
  };
});

import { vectorQuerySearch } from './vector-search';

describe('vectorQuerySearch', () => {
  const model = { specificationVersion: 'v1' } as any;
  const baseParams = {
    indexName: 'docs',
    queryText: 'circuit breaker',
    model,
    topK: 3,
  };

  const createStore = (id: string, retrievalModes: readonly ('dense' | 'hybrid')[]) => ({
    id,
    getCapabilities: vi.fn(() => ({ retrievalModes })),
    query: vi.fn().mockResolvedValue([]),
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps the existing dense query shape by default', async () => {
    const vectorStore = createStore('denseStore', ['dense']);

    const result = await vectorQuerySearch({ ...baseParams, vectorStore: vectorStore as any });

    expect(vectorStore.query).toHaveBeenCalledWith(
      expect.objectContaining({ indexName: 'docs', queryVector: expect.any(Array) }),
    );
    expect(vectorStore.query).not.toHaveBeenCalledWith(expect.objectContaining({ retrievalMode: 'hybrid' }));
    expect(result.retrievalModeUsed).toBe('dense');
  });

  it('forwards vector and original text for strict hybrid', async () => {
    const vectorStore = createStore('hybridStore', ['dense', 'hybrid']);

    const result = await vectorQuerySearch({ ...baseParams, retrievalMode: 'hybrid', vectorStore: vectorStore as any });

    expect(vectorStore.query).toHaveBeenCalledWith(
      expect.objectContaining({
        retrievalMode: 'hybrid',
        textQuery: 'circuit breaker',
        queryVector: expect.any(Array),
      }),
    );
    expect(result.retrievalModeUsed).toBe('hybrid');
  });

  it('resolves auto to dense for a dense-only store', async () => {
    const vectorStore = createStore('denseStore', ['dense']);

    const result = await vectorQuerySearch({ ...baseParams, retrievalMode: 'auto', vectorStore: vectorStore as any });

    expect(vectorStore.query).toHaveBeenCalledWith(expect.not.objectContaining({ retrievalMode: 'hybrid' }));
    expect(result.retrievalModeUsed).toBe('dense');
  });

  it('rejects strict hybrid when the store lacks the capability', async () => {
    const vectorStore = createStore('denseStore', ['dense']);

    await expect(
      vectorQuerySearch({ ...baseParams, retrievalMode: 'hybrid', vectorStore: vectorStore as any }),
    ).rejects.toThrow(/hybrid.*denseStore|denseStore.*hybrid/i);
  });
});
