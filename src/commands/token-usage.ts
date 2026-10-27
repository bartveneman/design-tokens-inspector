import { readFileSync } from "node:fs";
import {
  walkTokens,
  isRef,
} from "@nl-design-system-community/design-tokens-schema";

export function run(_args: string[] = []): void {
  if (_args.length !== 2) {
    console.error("Expected 2 arguments: pathToTokensJson + tokenPath");
    console.error("token-usage mytokens.json path.to.token");
    return;
  }

  const [path_to_tokens, token_path] = _args;

  const tokens_str = readFileSync(path_to_tokens, "utf-8");
  const raw_tokens = JSON.parse(tokens_str);

  let token_exists = false;
  const result: string[][] = [];
  walkTokens(raw_tokens, (token, path) => {
    if (token_path === path.slice(1).join(".")) {
      token_exists = true;
    }

    if (
      isRef(token.$value) &&
      (token.$value === `{${token_path}}` ||
        token.$value.startsWith(`{${token_path}`))
    ) {
      result.push(path);
    }
  });

  if (!token_exists) {
    console.error(`Token not found: ${token_path}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Found ${result.length} references to ${token_path}:`);
  for (const ref of result) {
    console.log(`\t - ${ref.join(".")}`);
  }
}
