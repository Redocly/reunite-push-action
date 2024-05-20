import path from 'path';
import * as core from '@actions/core';
import * as github from '@actions/github';
import { loadConfig } from '@redocly/openapi-core';
import { ParsedEventData, ParsedInputData } from './types';

export function parseInputData(): ParsedInputData {
  const redoclyOrgSlug = core.getInput('organization', { required: true });
  const redoclyProjectSlug = core.getInput('project', { required: true });
  const mountPath = core.getInput('mountPath', { required: true });
  const files = core.getInput('files', { required: true }).split(' ');

  const redoclyDomain =
    core.getInput('domain') || 'https://app.cloud.redocly.com';
  const maxExecutionTime = Number(core.getInput('maxExecutionTime')) || 1200;

  const absoluteFilePaths = files.map(_path =>
    path.join(process.env.GITHUB_WORKSPACE || '', _path),
  );

  return {
    redoclyOrgSlug,
    redoclyProjectSlug,
    mountPath,
    files: absoluteFilePaths,
    redoclyDomain,
    maxExecutionTime,
  };
}

export async function parseEventData(): Promise<ParsedEventData> {
  if (
    !(
      github.context.eventName === 'push' ||
      github.context.eventName === 'pull_request'
    )
  ) {
    throw new Error(
      'Unsupported GitHub event type. Only "push" and "pull_request" events are supported.',
    );
  }
  const namespace = github.context.payload?.repository?.owner?.login;
  const repository = github.context.payload?.repository?.name;

  if (!namespace || !repository) {
    throw new Error(
      'Invalid GitHub event data. Can not get owner or repository name from the event payload.',
    );
  }

  const branch =
    github.context.payload.pull_request?.['head']?.['ref'] ||
    github.context.ref.replace('refs/heads/', '');

  if (!branch) {
    throw new Error(
      'Invalid GitHub event data. Can not get branch from the event payload.',
    );
  }

  const defaultBranch: string | undefined =
    github.context.payload?.repository?.default_branch ||
    github.context.payload?.repository?.master_branch;

  if (!defaultBranch) {
    throw new Error(
      'Invalid GitHub event data. Can not get default branch from the event payload.',
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
    commitAuthor: `${commitData.commit.author?.name} <${commitData.commit.author?.email}>`,
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

function getCommitSha(): string | undefined {
  if (github.context.eventName === 'push') {
    return github.context.payload.after;
  }

  if (github.context.eventName === 'pull_request') {
    if (github.context.payload.action === 'opened') {
      return github.context.payload.pull_request?.head?.sha;
    }
    if (github.context.payload.action === 'synchronize') {
      return github.context.payload.after;
    }
  }
}

// Returns parsed config from the root or default config if not found
export async function getRedoclyConfig(): ReturnType<typeof loadConfig> {
  const redoclyConfig = await loadConfig();

  return redoclyConfig;
}
