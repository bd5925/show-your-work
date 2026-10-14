// Claude Code importer: one ~/.claude/projects/<project>/<sessionId>.jsonl file per session.
// Format checked against real sessions from Claude Code 2.1.x (Oct 2026). Each line is a JSON entry:
//   type 'user' | 'assistant'  → message.content is a string or an array of blocks
//                                 (text, thinking, tool_use, tool_result, image)
//   type 'custom-title' | 'ai-title' | 'summary' → session title
//   everything else (attachment, system, mode, file-history-*, cost-state, …) is ignored.
// Subagent transcripts live in <sessionId>/subagents/agent-*.jsonl with isSidechain: true; they are skipped.

import { capToolText, detach, timeRange, type Session, type Turn } from '../schema';

type Block = {
  type: string;
  text?: string;
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
  tool_use_id?: string;
  content?: string | Block[];
  is_error?: boolean;
};

type Entry = {
  type?: string;
  uuid?: string;
  sessionId?: string;
  timestamp?: string;
  cwd?: string;
  isSidechain?: boolean;
  isMeta?: boolean;
  isCompactSummary?: boolean;
  isApiErrorMessage?: boolean;
  customTitle?: string;
  aiTitle?: string;
  summary?: string;
  message?: { id?: string; model?: string; content?: string | Block[] };
};

// User-role text that Claude Code injects, not something the person typed.
const SYSTEM_TAGS = /^\s*<(task-notification|local-command-caveat|local-command-stdout|local-command-stderr|system-reminder)>/;

export function isSubagentPath(path: string): boolean {
  return /(^|[\\/])subagents[\\/]/.test(path);
}

/**
 * Parse every main-session file; subagent transcripts and empty sessions are dropped.
 * Files are read one at a time (e.g. `read: () => file.text()` for a dropped File) because a heavy user's
 * ~/.claude/projects runs to gigabytes and single sessions exceed 150 MB.
 */
export async function importClaudeCodeFiles(files: Iterable<{ path: string; read: () => Promise<string> }>): Promise<Session[]> {
  const out: Session[] = [];
  for (const f of files) {
    if (!f.path.endsWith('.jsonl') || isSubagentPath(f.path)) continue;
    const s = importClaudeCodeSession(await f.read());
    if (s) out.push(s);
  }
  return out;
}

export function importClaudeCodeSession(jsonl: string): Session | null {
  const turns: Turn[] = [];
  const toolNames = new Map<string, string>();
  const seen = new Set<string>();
  let id: string | undefined;
  let project: string | undefined;
  let customTitle: string | undefined;
  let aiTitle: string | undefined;

  for (const line of jsonl.split('\n')) {
    if (!line.trim()) continue;
    let e: Entry;
    try {
      e = JSON.parse(line);
    } catch {
      continue; // a session still being written can end in a partial line
    }
    id ??= e.sessionId;
    if (e.type === 'custom-title' && e.customTitle) customTitle = e.customTitle;
    if (e.type === 'ai-title' && e.aiTitle) aiTitle = e.aiTitle;
    if (e.type === 'summary' && e.summary) aiTitle ??= e.summary;
    if (e.type !== 'user' && e.type !== 'assistant') continue;
    if (e.isSidechain || e.isMeta || e.isCompactSummary || e.isApiErrorMessage) continue;
    if (!e.timestamp || !e.message) continue;
    project ??= e.cwd ? basename(e.cwd) : undefined;

    const at = new Date(e.timestamp).toISOString();
    const content = e.message.content;
    const blocks: Block[] = typeof content === 'string' ? [{ type: 'text', text: content }] : content ?? [];

    for (const b of blocks) {
      // Streaming occasionally writes the same block twice.
      const key = `${e.message.id ?? e.uuid}:${b.id ?? b.tool_use_id ?? ''}:${b.type}:${(b.text ?? '').slice(0, 200)}`;
      if (seen.has(key)) continue;
      seen.add(key);

      if (e.type === 'user') {
        if (b.type === 'text' && b.text) {
          const turn = userTextTurn(b.text, at);
          if (turn) turns.push(turn);
        } else if (b.type === 'tool_result') {
          const tool = toolNames.get(b.tool_use_id ?? '');
          const { text, truncated } = capToolText(resultText(b.content));
          const meta: Record<string, unknown> = { toolUseId: b.tool_use_id };
          if (b.is_error) meta.isError = true;
          if (truncated) meta.truncated = true;
          turns.push({ role: 'tool', at, text, ...(tool && { tool }), meta });
        }
      } else if (b.type === 'text' && b.text?.trim()) {
        turns.push({ role: 'assistant', at, text: b.text, meta: { model: e.message.model } });
      } else if (b.type === 'tool_use' && b.name) {
        if (b.id) toolNames.set(b.id, b.name);
        turns.push({
          role: 'assistant',
          at,
          text: describeToolCall(b.name, b.input ?? {}),
          tool: b.name,
          meta: { toolUseId: b.id },
        });
      }
      // thinking blocks are skipped: they are the model's, not the person's, and often long.
    }
  }

  const range = timeRange(turns);
  if (!id || !range) return null;
  return {
    id,
    source: 'claudecode',
    ...((customTitle ?? aiTitle) && { title: customTitle ?? aiTitle }),
    ...range,
    turns,
    ...(project && { project }),
  };
}

function userTextTurn(raw: string, at: string): Turn | null {
  if (SYSTEM_TAGS.test(raw)) return null;
  // Slash commands arrive as <command-name>/foo</command-name><command-args>…</command-args>.
  const cmd = /<command-name>([^<]*)<\/command-name>/.exec(raw);
  if (cmd) {
    const args = /<command-args>([\s\S]*?)<\/command-args>/.exec(raw)?.[1]?.trim();
    const name = cmd[1]!.trim();
    return { role: 'user', at, text: args ? `${name} ${args}` : name, meta: { command: name } };
  }
  const bash = /<bash-input>([\s\S]*?)<\/bash-input>/.exec(raw);
  if (bash) return { role: 'user', at, text: `!${bash[1]!.trim()}`, meta: { shell: true } };
  if (raw.startsWith('[Request interrupted by user')) {
    return { role: 'user', at, text: raw, meta: { interrupted: true } };
  }
  return raw.trim() ? { role: 'user', at, text: raw } : null;
}

function resultText(content: Block['content']): string {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content
    .map((c) => (c.type === 'text' ? c.text ?? '' : c.type === 'image' ? '[image]' : ''))
    .filter(Boolean)
    .join('\n');
}

/** A one-line description of a tool call; the full input (e.g. a whole written file) is not kept. */
function describeToolCall(name: string, input: Record<string, unknown>): string {
  const pick = (...keys: string[]) => {
    for (const k of keys) if (typeof input[k] === 'string' && input[k]) return input[k] as string;
    return undefined;
  };
  const detail = pick('command', 'file_path', 'notebook_path', 'pattern', 'url', 'query', 'description', 'prompt');
  return detail ? `${name}: ${detach(detail.split('\n')[0]!.slice(0, 300))}` : name;
}

function basename(p: string): string {
  return p.replace(/[\\/]+$/, '').split(/[\\/]/).pop() ?? p;
}
