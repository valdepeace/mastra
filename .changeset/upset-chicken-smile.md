---
'@mastra/rag': minor
'@mastra/azure-ai-search': patch
'@mastra/weaviate': patch
'@mastra/core': patch
---

Added a package-root export for direct provider-neutral retrieval with `vectorQuerySearch`.

```ts
const { results, retrievalModeUsed } = await vectorQuerySearch({
  vectorStore,
  indexName: 'documents',
  queryText: 'circuit breaker',
  model,
  topK: 5,
  retrievalMode: 'auto',
});
```
