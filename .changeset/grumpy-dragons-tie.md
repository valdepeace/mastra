---
'@mastra/weaviate': minor
---

Added native hybrid retrieval for Weaviate.

Use the shared query contract:

```ts
await vectorStore.query({
  indexName,
  queryVector,
  retrievalMode: 'hybrid',
  textQuery: 'retry budget guidance',
});
```

New Mastra-managed Weaviate collections index string `metadata.content` for native lexical matching.
