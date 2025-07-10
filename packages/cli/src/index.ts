#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { NewCommand } from './commands/new.js';
import { CreatePageCommand } from './commands/cli.js';
import { CreateReduxCommand } from './commands/createRedux.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Get package version
function getVersion() {
  try {
    // Read package.json using file path relative to the compiled output
    const pkgPath = join(__dirname, '../package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    return pkg.version;
  } catch (error) {
    console.error('Error reading package.json:', error);
    return '0.0.0';
  }
}

async function main() {
  const version = await getVersion();
  const program = new Command();

  program
    .name('nexus')
    .description('Nexus CLI for React applications with Angular-like features')
    .version(version, '-v, --version', 'output the current version');

  // Register commands
  program.addCommand(NewCommand());
  program.addCommand(CreatePageCommand());
  program.addCommand(CreateReduxCommand());

  // Show help if no arguments
  if (process.argv.length <= 2) {
    program.help();
  }

  await program.parseAsync(process.argv);
}

main().catch(console.error);
