---
'@mastra/rag': minor
---

Added dense, hybrid, and auto retrieval policies to vector query tools. Successful queries now report the effective `retrievalModeUsed`.

```ts
const tool = createVectorQueryTool({
  vectorStore,
  indexName: 'documents',
  retrievalMode: 'auto',
});
```
