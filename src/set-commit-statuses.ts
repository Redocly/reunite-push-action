import * as core from '@actions/core';
import * as github from '@actions/github';
import type { RestEndpointMethodTypes } from '@octokit/rest';

export type DeploymentStatus =
  | 'skipped'
  | 'pending'
  | 'success'
  | 'running'
  | 'failed';

export type CommitStatus = {
  name: string;
  description: string;
  status?: DeploymentStatus;
  url: string | null;
};

export async function setCommitStatuses({
  commitStatuses,
  owner,
  repo,
  commitId,
}: {
  commitStatuses: CommitStatus[];
  owner: string;
  repo: string;
  commitId: string;
}): Promise<void> {
  const githubToken = core.getInput('githubToken');
  const octokit = github.getOctokit(githubToken);

  if (commitStatuses?.length > 0) {
    // TBD: Should we add a concurrency limit here to avoid hitting rate limits?
    await Promise.all(
      commitStatuses.map(async status => {
        await octokit.rest.repos.createCommitStatus({
          owner,
          repo,
          sha: commitId,
          state: mapDeploymentStateToGithubCommitState(status.status),
          target_url: status.url,
          context: status.name,
          description: status.description,
        });
      }),
    );
  }
}

function mapDeploymentStateToGithubCommitState(
  state?: DeploymentStatus,
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
