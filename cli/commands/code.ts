import { kernel } from '../../src/lib/bizra-kernel';
import { processIntent } from '../../src/lib/gemini';
import chalk from 'chalk';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export async function codeCommand(intent: string) {
  console.log(chalk.cyan(`\n[DEMA CODE] Initializing Sovereign Code Operator...`));
  console.log(chalk.gray(`--------------------------------------------------`));

  // 1. Gather Context (Git & Workspace)
  let gitStatus = "Git not initialized or available.";
  try {
    gitStatus = execSync('git status --short').toString().trim() || 'Working tree clean';
  } catch (e) {
    gitStatus = "Git command failed. Ensure repository is initialized.";
  }

  // Gather top-level structure for context (excluding node_modules)
  let tree = "";
  try {
    const files = fs.readdirSync(process.cwd());
    tree = files.filter(f => !f.startsWith('.') && f !== 'node_modules').join('\n');
  } catch (e) {
    tree = "Unable to read directory.";
  }

  console.log(chalk.white(`Repo Context    : `) + chalk.green(`Loaded (Top-level scope)`));
  console.log(chalk.white(`Git Status      : `) + chalk.yellow(gitStatus.split('\n').length > 1 ? `${gitStatus.split('\n').length} files changed` : gitStatus));

  // 2. Evaluate Admissibility (FATE Gates)
  const mission = {
    id: `miss-code-${Date.now()}`,
    intent: `[CODE] ${intent}`,
    currentState: "Code modification requested",
    idealState: "Safe multi-file edits planned and staged",
    qualityScore: 0.98,
    timestamp: Date.now()
  };

  const admissibility = await kernel.evaluateAdmissibility(mission);

  if (!admissibility.isPermitted) {
    console.log(chalk.red(`\n[DENIED] Admissibility criteria failed for code operation.`));
    console.log(chalk.gray(JSON.stringify(admissibility.verdicts, null, 2)));
    return;
  }
  
  console.log(chalk.white(`FATE Kernel     : `) + chalk.green(`Admissible (Ihsān: ${admissibility.ihsanScore})`));
  console.log(chalk.gray(`--------------------------------------------------`));
  console.log(chalk.gray(`[DEMA] Polling Cognitive Mesh with Repo Context...`));

  // 3. Assemble Enhanced Prompt for Gemini
  const CodeContextPrompt = `
You are the DEMA Code Operator.
Context:
- Validated FATE Gates: Active
- Local Workspace Files:
${tree}
- Git Status:
${gitStatus}

User Intent: "${intent}"

Respond with:
1. OVERVIEW: A brief assessment of what needs changing.
2. MULTI-FILE EDITS: Proposed code modifications (use markdown code blocks and state the filepath).
3. GIT ACTIONS: The exact git commands to stage/commit these changes.
`;

  try {
    const geminiResponse = await processIntent(CodeContextPrompt);
    
    const receipt = await kernel.compile(mission);
    if (receipt) {
      console.log(chalk.blue(`\n[OPERATOR OUTPUT]`));
      console.log(chalk.white(geminiResponse));
      console.log(chalk.gray(`\n--------------------------------------------------`));
      console.log(chalk.yellow(`[RECEIPT GENERATED] Hash: ${receipt.evidenceHash}`));
    }

  } catch (error: any) {
    console.error(chalk.red(`[CRITICAL ERROR] Code execution failed: ${error.message}`));
  }
}
