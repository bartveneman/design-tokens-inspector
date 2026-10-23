import { readFileSync } from "node:fs";
import { walkTokens } from "@nl-design-system-community/design-tokens-schema";
import dlv from "dlv";

export function run(_args: string[] = []): void {
  if (_args.length < 2) {
    console.error("Expected minimum 2 arguments: pathToTokensJson + tokenPath");
    console.error("find mytokens.json path.to.token");
    return;
  }

  const [path_to_tokens, token_path, recursive] = _args;
  const is_recursive = recursive === "-r" || recursive === "--recursive";

  const tokens_str = readFileSync(path_to_tokens, "utf-8");
  const raw_tokens = JSON.parse(tokens_str);

  walkTokens(raw_tokens, (token, path) => {
    if (token_path === path.slice(1).join(".")) {
      console.log(token);

      if (is_recursive) {
        logReferences(raw_tokens, token, 1);
      }
    }
  });
}

function logReferences(
  raw_tokens: Record<string, unknown>,
  token: any,
  depth: number,
): void {
  const value = token.$value;

  if (
    typeof value !== "string" ||
    !value.startsWith("{") ||
    !value.endsWith("}")
  ) {
    return;
  }

  const ref_path = value.slice(1, -1);
  const ref_token = resolveRef(raw_tokens, ref_path);

  if (ref_token === undefined) {
    return;
  }

  console.log(`${"\t".repeat(depth)}→`, ref_token);
  logReferences(raw_tokens, ref_token, depth + 1);
}

function resolveRef(
  raw_tokens: Record<string, unknown>,
  ref_path: string,
): unknown {
  for (const set_name of Object.keys(raw_tokens)) {
    const resolved = dlv(raw_tokens[set_name], ref_path);

    if (resolved !== undefined) {
      return resolved;
    }
  }

  return undefined;
}
