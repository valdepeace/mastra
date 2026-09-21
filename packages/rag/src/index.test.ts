import { describe, expect, it } from 'vitest';
import { vectorQuerySearch } from './index';

describe('@mastra/rag public exports', () => {
  it('exports vectorQuerySearch for RAG-level retrieval callers', () => {
    expect(vectorQuerySearch).toBeTypeOf('function');
  });
});
