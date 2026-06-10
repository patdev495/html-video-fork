# Domain Docs

This repository uses a single-context domain documentation layout.

## Before exploring

- Read `docs/architecture.md` for the current package map, runtime flows,
  persistence model, extension points, and known technical risks.
- Read `CONTEXT.md` at the repository root when it exists.
- Read relevant architectural decisions under `docs/adr/` when the directory exists.
- If these files do not exist, proceed without treating their absence as an error.

The documentation can be created lazily when domain terminology or architectural decisions are established.

## Expected structure

```text
/
|-- CONTEXT.md
|-- docs/
|   `-- adr/
`-- packages/
```

## Domain vocabulary

Use terms as defined in `CONTEXT.md` in issue titles, implementation plans, tests, and architecture proposals. Avoid introducing synonyms for concepts already defined there.

If a needed concept is missing, determine whether the new term represents a genuine domain gap before adding it.

## ADR conflicts

Explicitly identify any proposed change that conflicts with an existing ADR instead of silently overriding the decision.
