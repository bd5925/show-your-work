import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { importChatGPT } from '../src/importers/chatgpt';
import { importClaude } from '../src/importers/claude';
import { importClaudeCodeFiles, importClaudeCodeSession } from '../src/importers/claudecode';
import { MAX_TOOL_TEXT, type Session } from '../src/schema';

const sample = (name: string) => readFileSync(new URL(`../samples/${name}`, import.meta.url), 'utf8');

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

function expectWellFormed(sessions: Session[]) {
  for (const s of sessions) {
    expect(s.id).toBeTruthy();
    expect(s.startedAt).toMatch(ISO);
    expect(s.endedAt).toMatch(ISO);
    expect(s.startedAt <= s.endedAt).toBe(true);
    expect(s.turns.length).toBeGreaterThan(0);
    for (const t of s.turns) {
      expect(['user', 'assistant', 'tool']).toContain(t.role);
      expect(t.at).toMatch(ISO);
      expect(typeof t.text).toBe('string');
    }
  }
}

describe('ChatGPT importer', () => {
  const sessions = importChatGPT(sample('chatgpt-conversations.json'));
  const [capRate, lease] = sessions;

  it('returns one session per non-empty conversation', () => {
    expect(sessions.map((s) => s.title)).toEqual(['Cap rate check', 'Lease abstract outline']);
    expectWellFormed(sessions);
    expect(sessions.every((s) => s.source === 'chatgpt')).toBe(true);
  });

  it('follows current_node, dropping regenerated branches and hidden context', () => {
    expect(capRate!.turns.map((t) => [t.role, t.text])).toEqual([
      ['user', "A building sells for $2,000,000 with NOI of $130,000. What's the cap rate?"],
      ['assistant', 'The cap rate is 7.5%.'],
      ['user', "No, that's wrong. 130,000 / 2,000,000 is 6.5%. Check it in Python."],
      ['assistant', '130000 / 2000000'],
      ['tool', '0.065'],
      ['assistant', "You're right, the cap rate is 6.5%."],
    ]);
  });

  it('marks tool calls and results with the tool name', () => {
    expect(capRate!.turns[3]).toMatchObject({ role: 'assistant', tool: 'python' });
    expect(capRate!.turns[4]).toMatchObject({ role: 'tool', tool: 'python' });
    expect(capRate!.turns[1]!.meta).toEqual({ model: 'gpt-4o' });
  });

  it('converts Unix seconds and falls back to the conversation time when a message has none', () => {
    expect(capRate!.startedAt).toBe('2024-05-01T10:40:10.000Z');
    expect(capRate!.endedAt).toBe('2024-05-01T10:41:55.000Z');
    expect(lease!.turns[0]!.at).toBe(new Date(1717200000 * 1000).toISOString());
  });

  it('reads multimodal parts, skips reasoning, and keeps project gizmos', () => {
    expect(lease!.turns[0]!.text).toBe(
      '[image]\nOutline a lease abstract template. Audience: asset managers. One page. Leave out legal advice.',
    );
    expect(lease!.turns.map((t) => t.role)).toEqual(['user', 'assistant']);
    expect(lease!.project).toBe('g-p-synthetic0000000000000000');
    expect(capRate!.project).toBeUndefined();
  });

  it('rejects a file that is not a conversation array', () => {
    expect(() => importChatGPT('{}')).toThrow(/array/);
  });
});

describe('Claude importer', () => {
  const sessions = importClaude(sample('claude-export.json'), sample('claude-projects.json'));
  const [plan, old] = sessions;

  it('returns one session per non-empty conversation', () => {
    expect(sessions.map((s) => s.title)).toEqual(['Rent roll cleanup plan', 'Old-format chat']);
    expectWellFormed(sessions);
    expect(sessions.every((s) => s.source === 'claude')).toBe(true);
  });

  it('follows parent links to the latest branch and expands content blocks', () => {
    expect(plan!.turns.map((t) => [t.role, t.tool ?? null, t.text])).toEqual([
      ['user', null, "Before you write anything, break the rent roll cleanup into steps. Don't touch the formulas yet."],
      ['assistant', 'web_search', 'web_search: rent roll normalization checklist'],
      ['tool', 'web_search', 'Synthetic search result.'],
      ['assistant', null, 'Step 1: dedupe units. Step 2: normalize dates. Step 3: reconcile totals.'],
      ['user', null, 'Actually, reconcile totals first, then dedupe.'],
      ['assistant', null, 'Reordered: reconcile, dedupe, normalize dates.'],
    ]);
  });

  it('keeps attachment names, project names, and microsecond timestamps', () => {
    expect(plan!.turns[0]!.meta).toEqual({ files: ['rent-roll-synthetic.csv'] });
    expect(plan!.project).toBe('Synthetic Portfolio');
    expect(plan!.startedAt).toBe('2024-06-01T15:00:00.123Z');
  });

  it('falls back to flat text for old exports', () => {
    expect(old!.turns.map((t) => [t.role, t.text])).toEqual([
      ['user', 'Summarize this memo in three bullets.'],
      ['assistant', '- One\n- Two\n- Three'],
    ]);
    expect(old!.project).toBeUndefined();
  });

  it('works without projects.json', () => {
    expect(importClaude(sample('claude-export.json'))[0]!.project).toBe('b0b0b0b0-0000-4000-8000-000000000001');
  });
});

describe('Claude Code importer', () => {
  const session = importClaudeCodeSession(sample('claudecode-session.jsonl'))!;

  it('reads session id, project, custom title, and time range', () => {
    expectWellFormed([session]);
    expect(session).toMatchObject({
      id: '11111111-2222-4333-8444-555555555555',
      source: 'claudecode',
      title: 'Deals CSV export',
      project: 'demo-app',
      startedAt: '2026-08-01T10:00:00.000Z',
      endedAt: '2026-08-01T10:30:00.000Z',
    });
  });

  it('keeps what the person typed and drops what Claude Code injected', () => {
    expect(session.turns.map((t) => [t.role, t.tool ?? null, t.text])).toEqual([
      ['user', null, "Add a CSV export to the deals table. Plan first, don't write code until I approve."],
      ['assistant', null, 'Plan: 1) add an export button, 2) serialize rows, 3) test with a 3-row fixture.'],
      ['user', null, "No, don't add a button. Put it in the existing Actions menu."],
      ['assistant', 'Edit', 'Edit: /Users/sample/Documents/demo-app/src/actions.ts'],
      ['tool', 'Edit', 'The file has been updated successfully.'],
      ['assistant', 'Bash', 'Bash: npm test -- export'],
      ['tool', 'Bash', 'FAIL export.test.ts: expected 3 rows, got 2'],
      ['user', null, '[Request interrupted by user for tool use]'],
      ['user', null, 'The header row is being counted. Fix the off-by-one, then rerun the test.'],
      ['user', null, '/commit ship csv export'],
      ['user', null, '!git log --oneline -1'],
      ['assistant', null, 'Fixed. 3 rows exported, tests pass, committed.'],
    ]);
  });

  it('flags errors, interruptions, slash commands, and shell input', () => {
    const t = session.turns;
    expect(t[6]!.meta).toMatchObject({ isError: true, toolUseId: 'toolu_2' });
    expect(t[7]!.meta).toEqual({ interrupted: true });
    expect(t[9]!.meta).toEqual({ command: '/commit' });
    expect(t[10]!.meta).toEqual({ shell: true });
    expect(t[1]!.meta).toEqual({ model: 'claude-opus-5-5' });
  });

  it('caps long tool output', () => {
    const line = JSON.stringify({
      type: 'user',
      sessionId: 's',
      timestamp: '2026-08-01T10:00:00.000Z',
      message: { role: 'user', content: [{ type: 'tool_result', tool_use_id: 'x', content: 'a'.repeat(MAX_TOOL_TEXT + 10) }] },
    });
    const t = importClaudeCodeSession(line)!.turns[0]!;
    expect(t.text.length).toBe(MAX_TOOL_TEXT);
    expect(t.meta).toMatchObject({ truncated: true });
  });

  it('returns null for a session with no conversation', () => {
    expect(importClaudeCodeSession('{"type":"mode","mode":"default","sessionId":"s"}\n')).toBeNull();
  });

  it('skips subagent transcripts and non-jsonl files without reading them', async () => {
    const text = sample('claudecode-session.jsonl');
    const read: string[] = [];
    const file = (path: string) => ({ path, read: async () => (read.push(path), text) });
    const sessions = await importClaudeCodeFiles([
      file('projects/-Users-sample-demo-app/1111.jsonl'),
      file('projects/-Users-sample-demo-app/1111/subagents/agent-abc.jsonl'),
      file('projects/-Users-sample-demo-app/memory/MEMORY.md'),
    ]);
    expect(sessions).toHaveLength(1);
    expect(read).toEqual(['projects/-Users-sample-demo-app/1111.jsonl']);
  });
});
