// ChatGPT importer: conversations.json from Settings → Data controls → Export.
// The file is an array of conversations. Messages form a tree in `mapping` (node id → {message, parent, children});
// regenerations and edits create branches. We follow `current_node` up to the root, which is the branch the
// user last saw. Timestamps are Unix seconds (float), sometimes null.
// Not yet checked against a real 2026 export; verify before relying on it.

import { capToolText, timeRange, type Session, type Turn } from '../schema';

type Content = {
  content_type?: string;
  parts?: unknown[];
  text?: string;
  result?: string;
  language?: string;
  thoughts?: unknown[];
};

type Message = {
  id?: string;
  author?: { role?: string; name?: string | null };
  create_time?: number | null;
  content?: Content;
  recipient?: string;
  metadata?: Record<string, unknown>;
};

type Node = { id?: string; message?: Message | null; parent?: string | null; children?: string[] };

type Conversation = {
  id?: string;
  conversation_id?: string;
  title?: string | null;
  create_time?: number | null;
  update_time?: number | null;
  mapping?: Record<string, Node>;
  current_node?: string | null;
  gizmo_id?: string | null;
};

// Content types that carry no conversation: custom instructions, memory, reasoning, browsing chrome.
const SKIP_CONTENT = new Set([
  'user_editable_context',
  'model_editable_context',
  'thoughts',
  'reasoning_recap',
  'tether_browsing_display',
  'system_error',
]);

/** Accepts the conversations.json text or its parsed value. */
export function importChatGPT(input: string | unknown): Session[] {
  const data = typeof input === 'string' ? JSON.parse(input) : input;
  if (!Array.isArray(data)) throw new Error('ChatGPT export: expected conversations.json to be an array');
  const out: Session[] = [];
  for (const c of data as Conversation[]) {
    const s = importConversation(c);
    if (s) out.push(s);
  }
  return out;
}

function importConversation(c: Conversation): Session | null {
  const mapping = c.mapping ?? {};
  const id = c.conversation_id ?? c.id;
  if (!id) return null;
  const fallbackAt = c.create_time ?? c.update_time ?? null;

  const turns: Turn[] = [];
  for (const m of activeBranch(mapping, c.current_node)) {
    const turn = toTurn(m, fallbackAt);
    if (turn) turns.push(turn);
  }

  const range = timeRange(turns);
  if (!range) return null;
  return {
    id,
    source: 'chatgpt',
    ...(c.title && { title: c.title }),
    ...range,
    turns,
    // ChatGPT Projects are gizmos with a 'g-p-' id; plain 'g-' ids are custom GPTs, not projects.
    ...(c.gizmo_id?.startsWith('g-p-') && { project: c.gizmo_id }),
  };
}

/** Messages on the path root → current_node. Falls back to following first children from the root. */
function activeBranch(mapping: Record<string, Node>, current?: string | null): Message[] {
  const path: Message[] = [];
  if (current && mapping[current]) {
    const visited = new Set<string>();
    for (let id: string | null | undefined = current; id && mapping[id] && !visited.has(id); id = mapping[id]!.parent) {
      visited.add(id);
      const m = mapping[id]!.message;
      if (m) path.push(m);
    }
    return path.reverse();
  }
  let node = Object.values(mapping).find((n) => !n.parent || !mapping[n.parent]);
  const visited = new Set<Node>();
  while (node && !visited.has(node)) {
    visited.add(node);
    if (node.message) path.push(node.message);
    const next: string | undefined = node.children?.[0];
    node = next ? mapping[next] : undefined;
  }
  return path;
}

function toTurn(m: Message, fallbackAt: number | null): Turn | null {
  const role = m.author?.role;
  if (role !== 'user' && role !== 'assistant' && role !== 'tool') return null;
  if (m.metadata?.is_visually_hidden_from_conversation) return null;
  const ct = m.content?.content_type ?? 'text';
  if (SKIP_CONTENT.has(ct)) return null;

  const text = contentText(m.content);
  if (!text.trim()) return null;
  const seconds = m.create_time ?? fallbackAt;
  if (seconds == null) return null;
  const at = new Date(seconds * 1000).toISOString();

  if (role === 'tool') {
    const capped = capToolText(text);
    return {
      role: 'tool',
      at,
      text: capped.text,
      ...(m.author?.name && { tool: m.author.name }),
      meta: { contentType: ct, ...(capped.truncated && { truncated: true }) },
    };
  }
  // An assistant message addressed to something other than 'all' is a tool call (python, web, dalle…).
  const recipient = m.recipient && m.recipient !== 'all' ? m.recipient : undefined;
  if (role === 'assistant' && recipient) {
    return { role: 'assistant', at, text: capToolText(text).text, tool: recipient, meta: { contentType: ct } };
  }
  const meta: Record<string, unknown> = {};
  if (ct !== 'text') meta.contentType = ct;
  if (role === 'assistant' && typeof m.metadata?.model_slug === 'string') meta.model = m.metadata.model_slug;
  return { role, at, text, ...(Object.keys(meta).length && { meta }) };
}

function contentText(c: Content | undefined): string {
  if (!c) return '';
  if (typeof c.text === 'string') return c.text; // code, tether_quote, …
  if (typeof c.result === 'string') return c.result; // execution_output in some exports
  if (!Array.isArray(c.parts)) return '';
  return c.parts
    .map((p) => {
      if (typeof p === 'string') return p;
      if (p && typeof p === 'object') {
        const part = p as { content_type?: string; text?: string };
        if (typeof part.text === 'string') return part.text;
        if (part.content_type?.includes('image')) return '[image]';
        if (part.content_type?.includes('audio')) return '[audio]';
      }
      return '';
    })
    .filter(Boolean)
    .join('\n');
}
