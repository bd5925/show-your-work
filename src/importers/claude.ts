// Claude (claude.ai) importer: conversations.json from Settings → Privacy → Export data.
// The file is an array of conversations, each with `chat_messages` (sender 'human' | 'assistant').
// Newer exports give each message a `content` block array (text, thinking, tool_use, tool_result) and a
// `parent_message_uuid`; older ones only have a flat `text`. When parents are present we keep the branch that
// ends at the newest message, which is what the user last saw. projects.json is read separately for names.
// Not yet checked against a real 2026 export; verify before relying on it.

import { capToolText, detach, timeRange, type Session, type Turn } from '../schema';

type Block = {
  type?: string;
  text?: string;
  name?: string;
  input?: Record<string, unknown>;
  content?: unknown;
  is_error?: boolean;
  start_timestamp?: string | null;
};

type ChatMessage = {
  uuid?: string;
  parent_message_uuid?: string;
  sender?: string;
  text?: string;
  content?: Block[];
  created_at?: string;
  attachments?: { file_name?: string }[];
  files?: { file_name?: string }[];
};

type Conversation = {
  uuid?: string;
  name?: string;
  created_at?: string;
  updated_at?: string;
  project_uuid?: string;
  project?: { uuid?: string; name?: string };
  chat_messages?: ChatMessage[];
};

/** Accepts conversations.json (text or parsed), and optionally projects.json to name projects. */
export function importClaude(input: string | unknown, projectsInput?: string | unknown): Session[] {
  const data = typeof input === 'string' ? JSON.parse(input) : input;
  if (!Array.isArray(data)) throw new Error('Claude export: expected conversations.json to be an array');
  const projectNames = readProjects(projectsInput);
  const out: Session[] = [];
  for (const c of data as Conversation[]) {
    const s = importConversation(c, projectNames);
    if (s) out.push(s);
  }
  return out;
}

function readProjects(input: string | unknown): Map<string, string> {
  const names = new Map<string, string>();
  if (input == null) return names;
  const data = typeof input === 'string' ? JSON.parse(input) : input;
  if (Array.isArray(data)) for (const p of data) if (p?.uuid && p?.name) names.set(p.uuid, p.name);
  return names;
}

function importConversation(c: Conversation, projectNames: Map<string, string>): Session | null {
  if (!c.uuid) return null;
  const fallbackAt = c.created_at ?? c.updated_at;
  const turns: Turn[] = [];
  for (const m of activeBranch(c.chat_messages ?? [])) {
    const at = iso(m.created_at ?? fallbackAt);
    if (!at) continue;
    turns.push(...messageTurns(m, at));
  }
  const range = timeRange(turns);
  if (!range) return null;
  const projectId = c.project_uuid ?? c.project?.uuid;
  const project = c.project?.name ?? (projectId ? projectNames.get(projectId) ?? projectId : undefined);
  return {
    id: c.uuid,
    source: 'claude',
    ...(c.name && { title: c.name }),
    ...range,
    turns,
    ...(project && { project }),
  };
}

/** If messages carry parent links, walk back from the last one; otherwise keep file order. */
function activeBranch(messages: ChatMessage[]): ChatMessage[] {
  const byId = new Map<string, ChatMessage>();
  for (const m of messages) if (m.uuid) byId.set(m.uuid, m);
  const last = messages[messages.length - 1];
  if (!last || !messages.some((m) => m.parent_message_uuid && byId.has(m.parent_message_uuid))) return messages;
  const path: ChatMessage[] = [];
  const visited = new Set<string>();
  for (let m: ChatMessage | undefined = last; m && !visited.has(m.uuid ?? ''); m = byId.get(m.parent_message_uuid ?? '')) {
    visited.add(m.uuid ?? '');
    path.push(m);
  }
  return path.reverse();
}

function messageTurns(m: ChatMessage, at: string): Turn[] {
  const role = m.sender === 'human' ? 'user' : m.sender === 'assistant' ? 'assistant' : undefined;
  if (!role) return [];
  const files = [...(m.attachments ?? []), ...(m.files ?? [])].map((f) => f.file_name).filter(Boolean);
  const fileMeta = files.length ? { files } : undefined;

  if (!Array.isArray(m.content) || m.content.length === 0) {
    return m.text?.trim() ? [{ role, at, text: m.text, ...(fileMeta && { meta: fileMeta }) }] : [];
  }

  const turns: Turn[] = [];
  for (const b of m.content) {
    const bAt = iso(b.start_timestamp) ?? at;
    if (b.type === 'text' && b.text?.trim()) {
      turns.push({ role, at: bAt, text: b.text });
    } else if (b.type === 'tool_use' && b.name) {
      turns.push({ role: 'assistant', at: bAt, text: describeToolCall(b.name, b.input ?? {}), tool: b.name });
    } else if (b.type === 'tool_result') {
      const { text, truncated } = capToolText(resultText(b.content));
      const meta: Record<string, unknown> = {};
      if (b.is_error) meta.isError = true;
      if (truncated) meta.truncated = true;
      turns.push({ role: 'tool', at: bAt, text, ...(b.name && { tool: b.name }), ...(Object.keys(meta).length && { meta }) });
    }
    // thinking blocks are skipped: the model's, not the person's.
  }
  // Attach file names to the first turn of the message so they aren't lost.
  if (fileMeta && turns[0]) turns[0].meta = { ...turns[0].meta, ...fileMeta };
  return turns;
}

function resultText(content: unknown): string {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content
    .map((c) => (c && typeof c === 'object' && typeof (c as Block).text === 'string' ? (c as Block).text! : ''))
    .filter(Boolean)
    .join('\n');
}

function describeToolCall(name: string, input: Record<string, unknown>): string {
  for (const k of ['query', 'url', 'command', 'title', 'path']) {
    const v = input[k];
    if (typeof v === 'string' && v) return `${name}: ${detach(v.split('\n')[0]!.slice(0, 300))}`;
  }
  return name;
}

function iso(s: string | null | undefined): string | undefined {
  if (!s) return undefined;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}
