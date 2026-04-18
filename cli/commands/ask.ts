import { kernel } from '../../src/lib/bizra-kernel';
import { processIntent } from '../../src/lib/gemini';
import chalk from 'chalk';

export async function askCommand(intent: string) {
  console.log(chalk.cyan(`[DEMA] Ingesting intent: "${intent}"`));
  console.log(chalk.gray(`[DEMA] Polling FATE admissibility gates...`));

  try {
    const geminiResponse = await processIntent(intent);

    const mission = {
      id: `miss-cli-${Date.now()}`,
      intent: intent,
      currentState: "Entropy Detected",
      idealState: geminiResponse.substring(0, 50),
      qualityScore: 0.98,
      timestamp: Date.now()
    };

    const admissibility = await kernel.evaluateAdmissibility(mission);

    if (admissibility.isPermitted) {
      console.log(chalk.green(`[VERDICTS] L1-L7 Cleared. Ihsan Floor: ${admissibility.ihsanScore}`));
      const receipt = await kernel.compile(mission);
      if (receipt) {
        console.log(chalk.blue(`\n[RESPONSE]`));
        console.log(chalk.white(geminiResponse));
        console.log(chalk.yellow(`\n[RECEIPT GENERATED] Hash: ${receipt.evidenceHash}`));
      }
    } else {
      console.log(chalk.red(`[DENIED] Admissibility criteria failed.`));
      console.log(chalk.gray(JSON.stringify(admissibility.verdicts, null, 2)));
    }

  } catch (error: any) {
    console.error(chalk.red(`[CRITICAL ERROR] Execution failed: ${error.message}`));
  }
}
