# Architecture sync pipeline

```mermaid
flowchart LR
  Projects[*/docs/architecture] --> Validate[arch:validate-all]
  Validate --> Sync[arch:sync-all]
  Sync --> Writes[writes/*-architecture.mdx]
  Writes --> Orbit[Orbit /writes/slug]
```
