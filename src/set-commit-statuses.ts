import * as core from '@actions/core';
import * as github from '@actions/github';
import type { RestEndpointMethodTypes } from '@octokit/rest';
import { DeploymentStatus } from '@redocly/cli/lib/cms/api/types';
import { PushStatusSummary } from '@redocly/cli/lib/cms/commands/push-status';

export async function setCommitStatuses({
  data,
  owner,
  repo,
  commitId
}: {
  data: PushStatusSummary;
  owner: string;
  repo: string;
  commitId: string;
}): Promise<void> {
  const githubToken = core.getInput('githubToken');
  const octokit = github.getOctokit(githubToken);

  if (data.commit.statuses?.length > 0) {
    // TBD: Should we add a concurrency limit here to avoid hitting rate limits?
    await Promise.all(
      data.commit.statuses.map(async status => {
        await octokit.rest.repos.createCommitStatus({
          owner,
          repo,
          sha: commitId,
          state: mapDeploymentStateToGithubCommitState(status.status),
          target_url: status.url,
          context: status.name,
          description: status.description
        });
      })
    );
  }
}

function mapDeploymentStateToGithubCommitState(
  state?: DeploymentStatus
): RestEndpointMethodTypes['repos']['createCommitStatus']['parameters']['state'] {
  switch (state) {
    case 'pending':
    case 'running':
      return 'pending';
    case 'success':
      return 'success';
    case 'failed':
      return 'error';
    default:
      throw new TypeError(`Unknown deployment state: ${state}`);
  }
}
