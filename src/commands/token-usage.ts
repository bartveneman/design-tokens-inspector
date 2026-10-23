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

  const result: string[][] = [];
  walkTokens(raw_tokens, (token, path) => {
    if (
      isRef(token.$value) &&
      (token.$value === `{${token_path}}` ||
        token.$value.startsWith(`{${token_path}`))
    ) {
      result.push(path);
    }
  });

  console.log(`Found ${result.length} references to ${token_path}:`);
  for (const ref of result) {
    console.log(`\t - ${ref.join(".")}`);
  }
}
