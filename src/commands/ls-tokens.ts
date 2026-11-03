import { readFileSync } from "node:fs";
import {
  walkTokens,
  isRef,
} from "@nl-design-system-community/design-tokens-schema";

export function run(_args: string[] = []): void {
  if (_args.length < 1) {
    console.error("Expected 1 argument: pathToTokensJson + path (optional)");
    console.error("ls-tokens mytokens.json common/base");
    return;
  }

  const [path_to_tokens, path] = _args;

  const tokens_str = readFileSync(path_to_tokens, "utf-8");
  const raw_tokens = JSON.parse(tokens_str);

  const result: unknown[] = [];
  walkTokens(raw_tokens, (token, tokenPath) => {
    if (!path || tokenPath.join(".").startsWith(path)) {
      result.push({
        path: tokenPath,
        token,
      });
    }
  });

  console.log(`Found ${result.length} tokens on path ${path}:`);
  console.table(
    result.map((i) => ({
      path: i.path.slice(1).join("."),
      value: i.token.$value,
    })),
  );
}
