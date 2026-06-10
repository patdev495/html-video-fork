import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  AssetStore,
  EngineRegistry,
  ProjectOrchestrator,
  ProjectStore,
  TemplateRegistry,
} from '../dist/index.js';
import { readFile } from 'node:fs/promises';

async function createHarness() {
  const projectRoot = await mkdtemp(join(tmpdir(), 'hv-language-test-'));
  const projects = new ProjectStore(projectRoot);
  const orchestrator = new ProjectOrchestrator({
    projectRoot,
    engines: new EngineRegistry(),
    templates: new TemplateRegistry(),
    projects,
    assets: new AssetStore({ projectRoot }),
  });
  return {
    projectRoot,
    projects,
    orchestrator,
    cleanup: () => rm(projectRoot, { recursive: true, force: true }),
  };
}

test('changing the language choice persists the target without mutating current content', async () => {
  const h = await createHarness();
  try {
    const created = await h.orchestrator.create({
      name: 'Language project',
      preferences: { language: 'auto', contentLanguage: 'en' },
    });

    const updated = await h.orchestrator.setContentLanguage(created.id, {
      choice: 'vi',
      openingRequest: 'Create a product video',
    });
    const reloaded = await h.projects.load(created.id);

    assert.equal(updated.preferences.language, 'vi');
    assert.equal(updated.preferences.targetLanguage, 'vi');
    assert.equal(updated.preferences.contentLanguage, 'en');
    assert.deepEqual(reloaded.preferences, updated.preferences);
  } finally {
    await h.cleanup();
  }
});

test('successful generation commits the target as the current content language', async () => {
  const h = await createHarness();
  try {
    const created = await h.orchestrator.create({
      name: 'Generated language project',
      preferences: { language: 'vi', targetLanguage: 'vi', contentLanguage: 'en' },
    });

    const updated = await h.orchestrator.markContentLanguageGenerated(created.id);

    assert.equal(updated.preferences.targetLanguage, 'vi');
    assert.equal(updated.preferences.contentLanguage, 'vi');
  } finally {
    await h.cleanup();
  }
});

test('multi-frame translation replaces graph and frames together', async () => {
  const h = await createHarness();
  try {
    const project = await h.orchestrator.create({
      name: 'Atomic translation',
      preferences: { language: 'vi', targetLanguage: 'vi', contentLanguage: 'en' },
    });
    const graph = {
      schemaVersion: 1,
      intent: 'explainer',
      nodes: [
        { id: 'intro', kind: 'text', durationSec: 3, text: 'Hello' },
        { id: 'outro', kind: 'text', durationSec: 3, text: 'Goodbye' },
      ],
      edges: [{ from: 'intro', to: 'outro', kind: 'sequence' }],
    };
    await h.orchestrator.writeContentGraph(project.id, graph);
    await h.orchestrator.writeFrameHtml(project.id, 'intro', '<html>hello</html>');
    await h.orchestrator.writeFrameHtml(project.id, 'outro', '<html>goodbye</html>');

    const translatedGraph = {
      ...graph,
      nodes: [
        { ...graph.nodes[0], text: 'Xin chào' },
        { ...graph.nodes[1], text: 'Tạm biệt' },
      ],
    };
    const updated = await h.orchestrator.replaceGeneratedContentAtomic(project.id, {
      graph: translatedGraph,
      frames: {
        intro: '<html>xin chào</html>',
        outro: '<html>tạm biệt</html>',
      },
      contentLanguage: 'vi',
    });

    assert.equal(updated.preferences.contentLanguage, 'vi');
    assert.equal((await h.orchestrator.readContentGraph(project.id)).nodes[0].text, 'Xin chào');
    assert.equal(await readFile(updated.frames[0].htmlPath, 'utf8'), '<html>xin chào</html>');
  } finally {
    await h.cleanup();
  }
});

test('invalid multi-frame translation leaves existing artifacts unchanged', async () => {
  const h = await createHarness();
  try {
    const project = await h.orchestrator.create({
      name: 'Atomic rollback',
      preferences: { language: 'vi', targetLanguage: 'vi', contentLanguage: 'en' },
    });
    const graph = {
      schemaVersion: 1,
      intent: 'explainer',
      nodes: [{ id: 'intro', kind: 'text', durationSec: 3, text: 'Hello' }],
      edges: [],
    };
    await h.orchestrator.writeContentGraph(project.id, graph);
    const before = await h.orchestrator.writeFrameHtml(project.id, 'intro', '<html>hello</html>');

    await assert.rejects(
      h.orchestrator.replaceGeneratedContentAtomic(project.id, {
        graph: { ...graph, nodes: [{ ...graph.nodes[0], text: 'Xin chào' }] },
        frames: {},
        contentLanguage: 'vi',
      }),
      /exactly one HTML document/,
    );

    const reloaded = await h.orchestrator.load(project.id);
    assert.equal(reloaded.preferences.contentLanguage, 'en');
    assert.equal((await h.orchestrator.readContentGraph(project.id)).nodes[0].text, 'Hello');
    assert.equal(await readFile(before.frame.htmlPath, 'utf8'), '<html>hello</html>');
  } finally {
    await h.cleanup();
  }
});
