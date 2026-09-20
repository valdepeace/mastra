---
'@mastra/azure-ai-search': minor
---

Added provider-neutral hybrid retrieval support to Azure AI Search using its native text and vector fusion.

```ts
const results = await vectorStore.query({
  indexName: 'documents',
  queryVector,
  retrievalMode: 'hybrid',
  textQuery: 'circuit breaker',
});
```
