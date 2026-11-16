import { Plugin } from '@opencode/plugin';

const EDIT_TOOLS = new Set(['edit', 'write']);
const SHELL_TOOLS = new Set(['shell', 'bash']);
const LINT_PATTERN = /pnpm\s+lint/;
const GATE_REMINDER =
  '\n\n> ⚠️ Quality gate: run `pnpm lint` (ESLint + tsc) and `pnpm test:run` before finishing this task.';

function lintVerdict(output: string): string {
  const tail = output.slice(-4000);
  const eslint = tail.match(/(\d+) problems? \((\d+) errors?, (\d+) warnings?\)/);
  const tscErrors = (tail.match(/\berror TS\d+/g) ?? []).length;
  const failed =
    (eslint ? Number(eslint[2]) : 0) > 0 || tscErrors > 0 || /\[ELIFECYCLE\]|ERR_PNPM/.test(tail);
  if (failed) return 'Lint/type-check FAILED — fix the errors above before continuing.';
  const clean =
    /(^|\D)0 errors\b/.test(tail) || /No files? (found|fixed)/i.test(tail) || /Done in/.test(tail);
  return clean ? 'Lint/type-check passed ✓' : '';
}

interface ResultLike {
  content?: string | ReadonlyArray<{ type: string; text?: string }>;
}

function resultText(result: ResultLike): string {
  if (typeof result.content === 'string') return result.content;
  if (!result.content) return '';
  return result.content.map((part) => (part.type === 'text' ? (part.text ?? '') : '')).join('\n');
}

function appendText(result: ResultLike, text: string): void {
  const { content } = result;
  if (content === undefined) {
    result.content = text;
    return;
  }
  if (typeof content === 'string') {
    result.content = content + text;
    return;
  }
  const last = content[content.length - 1];
  result.content =
    last && last.type === 'text'
      ? [...content.slice(0, -1), { type: 'text', text: `${last.text ?? ''}${text}` }]
      : [...content, { type: 'text', text }];
}

export default Plugin.define({
  id: 'fastfood.quality-gate',
  async setup(ctx) {
    await ctx.tool.hook('execute.after', (event) => {
      try {
        if (event.status !== 'completed') return;
        if (EDIT_TOOLS.has(event.tool)) {
          appendText(event.result, GATE_REMINDER);
          return;
        }
        const command = String((event.input as { command?: string } | undefined)?.command ?? '');
        if (SHELL_TOOLS.has(event.tool) && LINT_PATTERN.test(command)) {
          const verdict = lintVerdict(resultText(event.result));
          if (verdict) appendText(event.result, `\n\n> ${verdict}`);
        }
      } catch {
        // never break a tool result because of the plugin
      }
    });
  },
});
