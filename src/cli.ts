#!/usr/bin/env node
import { parseArgs } from "node:util";
import { run as usage } from "./commands/usage.ts";
import { run as tokenUsage } from "./commands/token-usage.ts";
import { run as find } from "./commands/find.ts";
import { run as lsTypes } from "./commands/ls-types.ts";
import { run as lsTodos } from "./commands/ls-todos.ts";
import { run as lsTokens } from "./commands/ls-tokens.ts";
import { run as lsDeprecations } from "./commands/ls-deprecations.ts";
import { run as lsHardcoded } from "./commands/ls-hardcoded.ts";

const commands = {
  usage,
  "token-usage": tokenUsage,
  find,
  "ls-types": lsTypes,
  "ls-todos": lsTodos,
  "ls-tokens": lsTokens,
  "ls-deprecations": lsDeprecations,
  "ls-hardcoded": lsHardcoded,
};

function main(): void {
  const { positionals, values } = parseArgs({
    args: process.argv.slice(2),
    allowPositionals: true,
    strict: false,
    options: {
      recursive: { type: "boolean", short: "r" },
      md: { type: "boolean" },
      skip: { type: "string", multiple: true },
    },
  });

  const [command, ...rest] = positionals;

  if (values.recursive) {
    rest.push("-r");
  }

  if (values.md) {
    rest.push("--md");
  }

  if (Array.isArray(values.skip)) {
    for (const pattern of values.skip) {
      rest.push(`--skip=${pattern}`);
    }
  }

  if (!command) {
    usage();
    return;
  }

  const handler = commands[command as keyof typeof commands];

  if (!handler) {
    console.error(`Unknown command: ${command}`);
    usage();
    process.exitCode = 1;
    return;
  }

  handler(rest);
}

main();
