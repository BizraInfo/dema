#!/usr/bin/env node

import { Command } from 'commander';
import { config } from 'dotenv';
import { askCommand } from './commands/ask';
import { statusCommand } from './commands/status';
import { receiptsCommand } from './commands/receipts';
import { codeCommand } from './commands/code';

config();

const program = new Command();

program
  .name('dema')
  .description('DEMA Sovereign CLI Interface - Terminal-first core proxy')
  .version('1.0.0-GENESIS');

program
  .command('ask')
  .description('Submit an intent to Dema')
  .argument('<intent>', 'The intent to execute')
  .action(askCommand);

program
  .command('code')
  .description('DEMA Code Operator (Repo-aware, multi-file edits, Git integration)')
  .argument('<intent>', 'The coding task or modification intent')
  .action(codeCommand);

program
  .command('status')
  .description('Verify system trust state and invariant gates')
  .action(statusCommand);

program
  .command('receipts')
  .description('Print the cryptographically verified receipt ledger')
  .action(receiptsCommand);

program.parse();
