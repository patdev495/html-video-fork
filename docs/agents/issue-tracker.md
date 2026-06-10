# Issue tracker: Local Markdown

Issues and PRDs for this repository live as Markdown files in `.scratch/`.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`
- The PRD is `.scratch/<feature-slug>/PRD.md`
- Implementation issues are `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`
- Triage state is recorded as a `Status:` line near the top of each issue file
- Comments and conversation history are appended under a `## Comments` heading
- Completed issues use `Status: done`

See `docs/agents/triage-labels.md` for the supported status values.

## Publish to the issue tracker

Create a new file under `.scratch/<feature-slug>/`, creating the directory if needed.

## Fetch a ticket

Read the referenced issue file. The user will normally provide its path or issue number.
