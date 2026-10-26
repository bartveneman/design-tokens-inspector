import { readFileSync } from "node:fs";
import { walkTokens } from "@nl-design-system-community/design-tokens-schema";

export function run(_args: string[] = []): void {
  if (_args.length !== 1) {
    console.error("Expected 1 argument: pathToTokensJson");
    console.error("ls-todos mytokens.json");
    return;
  }

  const [path_to_tokens] = _args;

  const tokens_str = readFileSync(path_to_tokens, "utf-8");
  const raw_tokens = JSON.parse(tokens_str);

  const result: { path: string; description: string; value: unknown }[] = [];
  walkTokens(raw_tokens, (token, path) => {
    if (
      typeof token.$description === "string" &&
      token.$description.toLowerCase().startsWith("todo")
    ) {
      result.push({
        path: path.slice(1).join("."),
        value: token.$value,
        description: token.$description,
      });
    }
  });

  console.log(`Found ${result.length} todos:`);
  console.table(result);
}
