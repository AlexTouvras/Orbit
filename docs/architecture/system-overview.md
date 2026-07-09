# Orbit content zones

```mermaid
flowchart TB
  Hub[Hub /] --> Writes[Writes MDX]
  Hub --> Portfolio[Portfolio + Workshop]
  Hub --> Radar[Signals RSS cache]
  Studio[/studio JSON edits] --> Hub
  Cron[news:fetch cron] --> Radar
  MDX[MDX + Mermaid] --> Writes
  MDX --> Portfolio
```
