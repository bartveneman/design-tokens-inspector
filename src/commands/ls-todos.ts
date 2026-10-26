import { readFileSync } from "node:fs";
import { walkTokens } from "@nl-design-system-community/design-tokens-schema";

function stripTodoPrefix(description: string): string {
  return description.replace(/^todo:?\s*/i, "");
}

export function run(_args: string[] = []): void {
  const is_md = _args.includes("--md");
  const positionals = _args.filter((a) => a !== "--md");

  if (positionals.length !== 1) {
    console.error("Expected 1 argument: pathToTokensJson");
    console.error("ls-todos mytokens.json [--md]");
    return;
  }

  const [path_to_tokens] = positionals;

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
        description: stripTodoPrefix(token.$description),
      });
    }
  });

  const groups = new Map<string, typeof result>();
  for (const item of result) {
    const key = item.description;
    const group = groups.get(key) ?? [];
    group.push(item);
    groups.set(key, group);
  }

  if (is_md) {
    console.log(`Found ${result.length} todos:\n`);
    for (const [key, items] of groups) {
      console.log(`## ${key} (${items.length})\n`);
      console.log(`| path | value |`);
      console.log(`| --- | --- |`);
      for (const i of items) {
        console.log(`| ${i.path} | ${JSON.stringify(i.value)} |`);
      }
      console.log("");
    }
    return;
  }

  console.log(`Found ${result.length} todos:`);

  for (const [key, items] of groups) {
    console.log(`\n${key} (${items.length}):`);
    console.table(
      items.map((i) => ({
        path: i.path,
        value: i.value,
      })),
    );
  }
}
