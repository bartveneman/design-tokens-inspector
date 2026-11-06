import { readFileSync } from "node:fs";
import { walkTokens } from "@nl-design-system-community/design-tokens-schema";

export function run(_args: string[] = []): void {
  const is_md = _args.includes("--md");
  const positionals = _args.filter((a) => a !== "--md");

  if (positionals.length !== 1) {
    console.error("Expected 1 argument: pathToTokensJson");
    console.error("ls-deprecations mytokens.json [--md]");
    return;
  }

  const [path_to_tokens] = positionals;

  const tokens_str = readFileSync(path_to_tokens, "utf-8");
  const raw_tokens = JSON.parse(tokens_str);

  const result: { path: string; message: string }[] = [];
  walkTokens(raw_tokens, (token, path) => {
    const deprecated = token.$deprecated;
    if (deprecated === undefined || deprecated === false) return;

    result.push({
      path: path.slice(1).join("."),
      message: typeof deprecated === "string" ? deprecated : "",
    });
  });

  console.log(`Found ${result.length} deprecated tokens:`);

  if (result.length === 0) return;

  if (is_md) {
    console.log("");
    console.log(`| path | message |`);
    console.log(`| --- | --- |`);
    for (const i of result) {
      console.log(`| ${i.path} | ${i.message} |`);
    }
    return;
  }

  console.table(result);
}
