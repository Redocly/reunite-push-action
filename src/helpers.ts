import path from 'path';
import * as core from '@actions/core';
import * as github from '@actions/github';
import { ParsedEventData, ParsedInputData } from './types';

export function parseInputData(): ParsedInputData {
  const organization = core.getInput('organization', { required: true });
  const project = core.getInput('project', { required: true });
  const mountPath = core.getInput('mountPath', { required: true });
  const files = core.getInput('files', { required: true }).split(' ');

  const redoclyDomain =
    core.getInput('domain') || 'https://app.cloud.redocly.com';
  const maxExecutionTime = Number(core.getInput('maxExecutionTime')) || 1200;
  const defaultBranch = core.getInput('defaultBranch') || undefined;

  const absoluteFilePaths = files.map(_path =>
    path.join(process.env.GITHUB_WORKSPACE || '', _path),
  );

  return {
    organization,
    project,
    mountPath,
    files: absoluteFilePaths,
    redoclyDomain,
    maxExecutionTime,
    defaultBranch,
  };
}

const SUPPORTED_EVENTS = [
  'push',
  'pull_request',
  'schedule',
  'workflow_dispatch',
];

export async function parseEventData(
  defaultBranchOverride?: string,
): Promise<ParsedEventData> {
  if (!SUPPORTED_EVENTS.includes(github.context.eventName)) {
    throw new Error(
      'Unsupported GitHub event type. Only "push", "pull_request", "schedule" and "workflow_dispatch" events are supported.',
    );
  }

  if (github.context.eventName === 'pull_request') {
    const allowedActions = ['opened', 'synchronize', 'reopened', 'stacked'];

    if (
      !github.context.payload.action ||
      !allowedActions.includes(github.context.payload.action)
    ) {
      throw new Error(
        'Unsupported GitHub event. Only "opened", "synchronize", "reopened" and "stacked" actions are supported for pull requests.',
      );
    }
  }

  const { owner: namespace, repo: repository } = github.context.repo;

  const branch =
    github.context.payload.pull_request?.['head']?.['ref'] ||
    github.context.ref.replace('refs/heads/', '');

  if (!branch) {
    throw new Error(
      'Invalid GitHub event data. Can not get branch from the event payload.',
    );
  }

  // GitHub runs scheduled workflows only on the default branch, and their event has no payload.
  const defaultBranch: string | undefined =
    defaultBranchOverride ||
    github.context.payload?.repository?.default_branch ||
    github.context.payload?.repository?.master_branch ||
    (github.context.eventName === 'schedule' ? branch : undefined);

  if (!defaultBranch) {
    throw new Error(
      'Invalid GitHub event data. Can not get default branch from the event payload. You can use the "defaultBranch" input to set it manually.',
    );
  }

  const commitSha = getCommitSha();

  if (!commitSha) {
    throw new Error(
      'Invalid GitHub event data. Can not get commit sha from the event payload.',
    );
  }

  const githubToken = core.getInput('githubToken');
  const octokit = github.getOctokit(githubToken);

  const { data: commitData } = await octokit.rest.repos.getCommit({
    owner: namespace,
    repo: repository,
    ref: commitSha,
  });

  if (!commitData.commit.author?.name || !commitData.commit.author?.email) {
    throw new Error(
      'Invalid GitHub event data. Can not get author name or email from the event payload.',
    );
  }

  const commit: ParsedEventData['commit'] = {
    commitSha,
    commitMessage: commitData.commit.message,
    commitUrl: commitData.html_url,
    commitAuthor: {
      name: commitData.commit.author.name,
      email: commitData.commit.author.email,
    },
    commitCreatedAt: commitData.commit.author?.date,
  };

  return {
    eventName: github.context.eventName,
    namespace,
    repository,
    branch,
    defaultBranch,
    commit,
  };
}

export function setRedoclyEnvironment(): void {
  const ref = process.env.GITHUB_ACTION_REF;

  process.env.REDOCLY_ENVIRONMENT = ref
    ? `redocly-reunite-push-action/${ref}`
    : 'redocly-reunite-push-action';
}

export function getCommitSha(): string | undefined {
  if (github.context.eventName === 'push') {
    return github.context.payload.after;
  }

  if (github.context.eventName === 'pull_request') {
    return github.context.payload.pull_request?.head?.sha;
  }

  return github.context.sha;
}
