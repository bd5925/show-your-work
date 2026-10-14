// The one normalized shape every importer returns. Keep in sync with CLAUDE.md.

export type Source = 'chatgpt' | 'claude' | 'grok' | 'claudecode' | 'other';

export type Role = 'user' | 'assistant' | 'tool';

export type Turn = {
  role: Role;
  /** ISO 8601 timestamp. */
  at: string;
  text: string;
  /** Tool name for tool calls (role 'assistant') and tool results (role 'tool'). */
  tool?: string;
  meta?: Record<string, unknown>;
};

export type Session = {
  id: string;
  source: Source;
  title?: string;
  /** ISO 8601 timestamp of the first turn. */
  startedAt: string;
  /** ISO 8601 timestamp of the last turn. */
  endedAt: string;
  turns: Turn[];
  project?: string;
};

/** Tool output is capped so a 150 MB Claude Code session doesn't hold every file it ever read. */
export const MAX_TOOL_TEXT = 4000;

export function capToolText(text: string): { text: string; truncated?: true } {
  return text.length > MAX_TOOL_TEXT ? { text: detach(text.slice(0, MAX_TOOL_TEXT)), truncated: true } : { text };
}

/** First and last turn timestamps, or null when there are no turns. */
export function timeRange(turns: Turn[]): { startedAt: string; endedAt: string } | null {
  if (turns.length === 0) return null;
  let min = turns[0]!.at;
  let max = min;
  for (const t of turns) {
    if (t.at < min) min = t.at;
    if (t.at > max) max = t.at;
  }
  return { startedAt: min, endedAt: max };
}

/**
 * A copy that doesn't pin its source. V8 implements slice() as a view into the original string, so a 4 KB
 * excerpt of a 2 MB tool result would keep all 2 MB alive.
 */
export function detach(s: string): string {
  return JSON.parse(JSON.stringify(s));
}
