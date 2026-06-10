# Continue Development on Linux

This repository is intended to be built and run on Linux.

## 1. Clone the Fork

```bash
git clone https://github.com/patdev495/html-video-fork.git
cd html-video
```

Current handoff commit:

```text
5abcf0a
```

## 2. Install Node.js and pnpm

Use Node.js 22. With NVM:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.nvm/nvm.sh
nvm install 22
nvm use 22
nvm alias default 22
```

Enable Corepack and install the project pnpm version:

```bash
corepack enable
corepack prepare pnpm@9.15.0 --activate
node --version
pnpm --version
```

## 3. Install Dependencies

```bash
pnpm install
```

Some export and rendering workflows require FFmpeg and Chromium dependencies:

```bash
sudo apt update
sudo apt install -y ffmpeg
```

## 4. Read the Project Context

Read these files before continuing development:

```bash
cat AGENTS.md
cat CONTEXT.md
cat docs/architecture.md
cat docs/handoff/2026-06-10-video-content-language.md
cat .scratch/video-content-language/PRD.md
```

The implementation issues are located at:

```text
.scratch/video-content-language/issues/
```

## 5. Verify the Current State

```bash
pnpm --filter @html-video/core test
pnpm --filter @html-video/cli test
node --check packages/project-studio/public/app.js
node --check packages/project-studio/public/i18n.js
```

Expected state at the handoff:

- Core: 10 tests passing
- CLI: 14 tests passing
- CLI TypeScript build passing
- Studio JavaScript syntax checks passing

## 6. Run the Studio

Build the workspace:

```bash
pnpm -r build
```

Check available commands:

```bash
./packages/cli/dist/bin.js --help
```

Start the Studio:

```bash
./packages/cli/dist/bin.js studio --port 3071
```

Then open:

```text
http://localhost:3071
```

## 7. Continue With an Agent

Open Codex or Claude Code from the repository root. Give it this instruction:

```text
Read AGENTS.md and docs/handoff/2026-06-10-video-content-language.md.
Continue implementing the video content language feature with the TDD skill.
Start from the unfinished translation endpoint and Translate button.
Run every build, test, render, and Studio command directly on Linux.
Do not push to nexu-io/html-video; use patdev495/html-video-fork.
```

The next implementation steps are:

1. Add the SSE translation endpoint using the selected project agent and model.
2. Implement atomic multi-frame translation.
3. Implement atomic single-frame translation.
4. Connect the Studio Translate button.
5. Add narration translation and voice compatibility.
6. Add font compatibility and advisory language validation.
7. Run full verification and update all issue statuses.

## 8. Git Workflow

Create a feature branch before continuing:

```bash
git switch -c codex/video-content-language
```

Push work to the fork:

```bash
git push -u origin codex/video-content-language
```

After cloning this repository, `origin` should point to:

```text
https://github.com/patdev495/html-video-fork.git
```

Verify before pushing:

```bash
git remote -v
git status
```
