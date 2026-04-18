import { kernel } from '../../src/lib/bizra-kernel';
import chalk from 'chalk';

export async function receiptsCommand() {
  console.log(chalk.cyan(`[DEMA LEDGER] Cryptographic Receipt Chain`));
  console.log(chalk.gray('--------------------------------------------------'));

  const chain = kernel.getChain();

  if (chain.length === 0) {
    console.log(chalk.yellow(`[LEDGER] No receipts recorded in current execution memory.`));
    return;
  }

  chain.forEach((receipt, index) => {
    console.log(chalk.white(`Receipt #${index} [${receipt.id}]`));
    console.log(chalk.gray(` Intent:    ${receipt.intent}`));
    console.log(chalk.gray(` Verdict:   ${receipt.verdict}`));
    console.log(chalk.gray(` Ihsān:     ${receipt.ihsanScore}`));
    console.log(chalk.yellow(` Hash:      ${receipt.evidenceHash}`));
    console.log(chalk.gray('--------------------------------------------------'));
  });
}
