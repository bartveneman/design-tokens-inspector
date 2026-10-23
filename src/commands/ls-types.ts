import { readFileSync } from "node:fs";
import {
  walkTokens,
  isRef,
} from "@nl-design-system-community/design-tokens-schema";

export function run(_args: string[] = []): void {
  if (_args.length !== 2) {
    console.error("Expected 2 arguments: pathToTokensJson + tokenType");
    console.error("ls-types mytokens.json fontWeights");
    return;
  }

  const [path_to_tokens, token_type] = _args;

  const tokens_str = readFileSync(path_to_tokens, "utf-8");
  const raw_tokens = JSON.parse(tokens_str);

  const result: unknown[] = [];
  walkTokens(raw_tokens, (token, path) => {
    if (token.$type === token_type && !isRef(token.$value)) {
      result.push({
        path,
        token,
      });
    }
  });

  console.log(`Found ${result.length} ${token_type} tokens:`);
  console.table(
    result.map((i) => ({
      path: i.path.slice(1).join("."),
      value: i.token.$value,
    })),
  );
}
