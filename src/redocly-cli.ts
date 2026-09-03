import { spawn } from 'node:child_process';
import * as path from 'node:path';
import type { ParsedEventData, ParsedInputData } from './types';

const PUSH_ID_REGEXP = /Push ID: (\S+)/;

// `npm run package` vendors the CLI next to the action bundle.
const REDOCLY_CLI_PATH = path.join(__dirname, 'redocly-cli', 'bin', 'cli.js');

export function extractPushId(cliOutput: string): string | undefined {
  return PUSH_ID_REGEXP.exec(cliOutput)?.[1];
}

export async function runRedoclyPush({
  inputData,
  ghEvent,
}: {
  inputData: ParsedInputData;
  ghEvent: ParsedEventData;
}): Promise<string> {
  // The `--flag=value` form protects values that start with a dash (e.g. a
  // commit message like "-wip") from being parsed as options.
  const pushArgs = [
    'push',
    ...inputData.files,
    `--organization=${inputData.redoclyOrgSlug}`,
    `--project=${inputData.redoclyProjectSlug}`,
    `--mount-path=${inputData.mountPath}`,
    `--domain=${inputData.redoclyDomain}`,
    `--max-execution-time=${inputData.maxExecutionTime}`,
    `--namespace=${ghEvent.namespace}`,
    `--repository=${ghEvent.repository}`,
    `--branch=${ghEvent.branch}`,
    `--default-branch=${ghEvent.defaultBranch}`,
    `--author=${ghEvent.commit.commitAuthor}`,
    `--message=${ghEvent.commit.commitMessage}`,
    `--commit-sha=${ghEvent.commit.commitSha}`,
    `--commit-url=${ghEvent.commit.commitUrl}`,
    ...(ghEvent.commit.commitCreatedAt
      ? [`--created-at=${ghEvent.commit.commitCreatedAt}`]
      : []),
  ];

  const output = await runRedoclyCli(pushArgs);
  const pushId = extractPushId(output);

  if (!pushId) {
    throw new Error('Could not find the push ID in the Redocly CLI output.');
  }

  return pushId;
}

async function runRedoclyCli(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [REDOCLY_CLI_PATH, ...args], {
      env: process.env,
    });

    let output = '';

    child.stdout.on('data', (chunk: Buffer) => {
      output += chunk.toString();
      process.stdout.write(chunk);
    });

    child.stderr.on('data', (chunk: Buffer) => {
      output += chunk.toString();
      process.stderr.write(chunk);
    });

    child.on('error', reject);

    child.on('close', code => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Redocly CLI exited with code ${code}.`));
      }
    });
  });
}
