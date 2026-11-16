import { readFileSync } from "node:fs";
import {
  walkTokens,
  isRef,
} from "@nl-design-system-community/design-tokens-schema";

function formatValue(value: unknown): string {
  return typeof value === "string" ? value : JSON.stringify(value);
}

/**
 * Pattern rules:
 * - ends with `.`: prefix match (`basis.`)
 * - otherwise: exact token path or group (`basis.color` skips `basis.color.*`)
 */
function createMatcher(pattern: string): (path: string) => boolean {
  if (pattern.endsWith(".")) {
    return (path) => path.startsWith(pattern);
  }

  return (path) => path === pattern || path.startsWith(`${pattern}.`);
}

export function run(_args: string[] = []): void {
  const is_md = _args.includes("--md");
  const skip_patterns = _args
    .filter((a) => a.startsWith("--skip="))
    .flatMap((a) => a.slice("--skip=".length).split(","))
    .map((p) => p.trim())
    .filter(Boolean);
  const positionals = _args.filter(
    (a) => a !== "--md" && !a.startsWith("--skip="),
  );

  if (positionals.length !== 1) {
    console.error("Expected 1 argument: pathToTokensJson");
    console.error("ls-hardcoded mytokens.json [--md] [--skip=basis.]");
    return;
  }

  const [path_to_tokens] = positionals;
  const skippers = skip_patterns.map(createMatcher);

  const tokens_str = readFileSync(path_to_tokens, "utf-8");
  const raw_tokens = JSON.parse(tokens_str);

  const result: { path: string; value: string }[] = [];
  walkTokens(raw_tokens, (token, path) => {
    if (isRef(token.$value)) return;

    const token_path = path.join(".");
    if (skippers.some((matches) => matches(token_path))) return;

    result.push({
      path: token_path,
      value: formatValue(token.$value),
    });
  });

  console.log(`Found ${result.length} hardcoded tokens:`);

  if (result.length === 0) return;

  if (is_md) {
    console.log("");
    console.log(`| path | value |`);
    console.log(`| --- | --- |`);
    for (const i of result) {
      console.log(`| ${i.path} | ${i.value} |`);
    }
    return;
  }

  console.table(result);
}
