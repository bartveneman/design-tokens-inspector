#!/usr/bin/env node
import { parseArgs } from "node:util";
import { run as usage } from "./commands/usage.ts";
import { run as tokenUsage } from "./commands/token-usage.ts";
import { run as find } from "./commands/find.ts";

const commands = {
  usage,
  "token-usage": tokenUsage,
  find,
};

function main(): void {
  const { positionals, values } = parseArgs({
    args: process.argv.slice(2),
    allowPositionals: true,
    strict: false,
    options: {
      recursive: { type: "boolean", short: "r" },
    },
  });

  const [command, ...rest] = positionals;

  if (values.recursive) {
    rest.push("-r");
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
