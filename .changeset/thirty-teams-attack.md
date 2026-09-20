---
'@mastra/core': minor
---

Added provider-neutral dense and hybrid retrieval modes with capability discovery and strict validation for hybrid text queries.

```ts
const results = await vectorStore.query({
  indexName: 'documents',
  queryVector,
  retrievalMode: 'hybrid',
  textQuery: 'circuit breaker',
});
```
