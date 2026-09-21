import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WeaviateVector } from './index';

const indexName = 'hybrid_index';
const collectionName = 'Hybrid_index';
const collectionMeta = JSON.stringify({ name: indexName, dimension: 2, metric: 'cosine' });

function createFilterApi(value: unknown) {
  const property = {
    isNull: vi.fn(() => value),
    equal: vi.fn(() => value),
    notEqual: vi.fn(() => value),
    greaterThan: vi.fn(() => value),
    greaterOrEqual: vi.fn(() => value),
    lessThan: vi.fn(() => value),
    lessOrEqual: vi.fn(() => value),
    containsAny: vi.fn(() => value),
    containsAll: vi.fn(() => value),
    containsNone: vi.fn(() => value),
  };

  return { byProperty: vi.fn(() => property) };
}

describe('WeaviateVector native hybrid retrieval', () => {
  let vectorStore: WeaviateVector;
  let collection: any;
  let client: any;

  beforeEach(() => {
    const filter = { operator: 'Equal', path: ['label'], valueText: 'matched' };
    collection = {
      config: {
        get: vi.fn(async () => ({
          description: collectionMeta,
          properties: [{ name: 'mastraId', dataType: ['text'], tokenization: 'field' }],
        })),
        addProperty: vi.fn(),
      },
      filter: createFilterApi(filter),
      query: {
        nearVector: vi.fn(async () => ({ objects: [] })),
        hybrid: vi.fn(async () => ({
          objects: [
            {
              uuid: 'weaviate-id',
              properties: { mastraId: 'document-1', label: 'matched' },
              metadata: { score: 0.82 },
            },
          ],
        })),
        fetchObjects: vi.fn(async () => ({ objects: [] })),
      },
      data: { insertMany: vi.fn(async () => ({ hasErrors: false, errors: {} })) },
    };
    client = {
      collections: {
        exists: vi.fn(async () => true),
        get: vi.fn(() => collection),
        create: vi.fn(),
      },
    };
    vectorStore = new WeaviateVector({ id: 'weaviate-unit-test' });
    (vectorStore as any).clientPromise = Promise.resolve(client);
  });

  it('advertises native hybrid support', () => {
    expect(vectorStore.getCapabilities()).toEqual({ retrievalModes: ['dense', 'hybrid'] });
  });

  it('keeps dense requests on nearVector', async () => {
    await vectorStore.query({ indexName, queryVector: [0.1, 0.2], topK: 3 });

    expect(collection.query.nearVector).toHaveBeenCalledWith([0.1, 0.2], expect.objectContaining({ limit: 3 }));
    expect(collection.query.hybrid).not.toHaveBeenCalled();
  });

  it('routes strict hybrid requests to native hybrid search with the shared query options', async () => {
    const results = await vectorStore.query({
      indexName,
      queryVector: [0.1, 0.2],
      topK: 3,
      filter: { label: 'matched' },
      includeVector: true,
      retrievalMode: 'hybrid',
      textQuery: 'circuit breaker retry behavior',
    });

    expect(collection.query.hybrid).toHaveBeenCalledWith(
      'circuit breaker retry behavior',
      expect.objectContaining({
        limit: 3,
        filters: { operator: 'Equal', path: ['label'], valueText: 'matched' },
        includeVector: true,
        vector: { vector: [0.1, 0.2] },
        alpha: 0.5,
        fusionType: 'RelativeScore',
        queryProperties: ['content'],
      }),
    );
    expect(collection.query.nearVector).not.toHaveBeenCalled();
    expect(results).toMatchObject([{ id: 'document-1', score: 0.82, metadata: { label: 'matched' } }]);
  });

  it('rejects blank hybrid text before calling Weaviate', async () => {
    await expect(
      vectorStore.query({
        indexName,
        queryVector: [0.1, 0.2],
        retrievalMode: 'hybrid',
        textQuery: '   ',
      }),
    ).rejects.toThrow(/textQuery/i);

    expect(client.collections.exists).not.toHaveBeenCalled();
    expect(collection.query.hybrid).not.toHaveBeenCalled();
  });

  it('creates searchable content and projects metadata.content without changing metadata round trips', async () => {
    client.collections.exists.mockResolvedValueOnce(false).mockResolvedValue(true);
    await vectorStore.createIndex({ indexName, dimension: 2 });
    await vectorStore.upsert({
      indexName,
      ids: ['document-1'],
      vectors: [[0.1, 0.2]],
      metadata: [{ content: 'retry budget guidance', label: 'matched' }],
    });

    expect(client.collections.create).toHaveBeenCalledWith(
      expect.objectContaining({
        properties: expect.arrayContaining([
          expect.objectContaining({ name: 'content', dataType: 'text', tokenization: 'word' }),
        ]),
      }),
    );
    expect(collection.data.insertMany).toHaveBeenCalledWith([
      expect.objectContaining({ properties: expect.objectContaining({ content: 'retry budget guidance' }) }),
    ]);
  });
});
