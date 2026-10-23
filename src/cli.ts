#!/usr/bin/env node
import { parseArgs } from "node:util";
import { run as usage } from "./commands/usage.ts";
import { run as tokenUsage } from "./commands/token-usage.ts";

const commands = {
  usage,
  "token-usage": tokenUsage,
};

function main(): void {
  const { positionals } = parseArgs({
    args: process.argv.slice(2),
    allowPositionals: true,
    strict: false,
  });

  const [command, ...rest] = positionals;

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
