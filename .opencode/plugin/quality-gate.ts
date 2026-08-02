import type { Plugin } from "@opencode-ai/plugin"

const EDIT_TOOLS = new Set(["edit", "write"])
const LINT_PATTERN = /pnpm\s+lint/
const GATE_REMINDER =
  "\n\n> ⚠️ Quality gate: run `pnpm lint` (ESLint + tsc) and `pnpm test:run` before finishing this task."

function lintVerdict(output: string): string {
  const tail = output.slice(-4000)
  const failed = /error|failed|✖|✗|Found \d+ errors/i.test(tail)
  const passed = /success|passed|✓|✨|No files? (found|fixed)|Done in/i.test(tail)
  if (failed && passed) return "Lint/type-check produced errors — review the output above."
  if (failed) return "Lint/type-check FAILED — fix the errors above before continuing."
  if (passed) return "Lint/type-check passed ✓"
  return ""
}

export default (async () => {
  return {
    "tool.execute.after": async (input, output) => {
      try {
        if (EDIT_TOOLS.has(input.tool)) {
          output.output = `${output.output}${GATE_REMINDER}`
          return
        }
        if (input.tool === "bash" && LINT_PATTERN.test(String(input.args?.command ?? ""))) {
          const verdict = lintVerdict(output.output)
          if (verdict) output.output = `${output.output}\n\n> ${verdict}`
        }
      } catch {
        // never break a tool result because of the plugin
      }
    },
  }
}) satisfies Plugin
