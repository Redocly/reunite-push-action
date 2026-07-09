import * as core from '@actions/core';
import type { PushResponse, PushStatusSummary } from './types';

// Mirrors the `push-status` command behavior of @redocly/cli, which is no
// longer importable from the published package (it ships as a self-contained
// CLI bundle since v2.34.0). Polling it here keeps the `onRetry` hook the
// action uses to update GitHub commit statuses while a deployment is running.
const RETRY_INTERVAL_MS = 5000;
const PENDING_DEPLOYMENT_STATUSES = ['pending', 'running'];

export interface WaitForDeploymentOptions {
  domain: string;
  organization: string;
  project: string;
  pushId: string;
  maxExecutionTime: number;
  retryIntervalMs?: number;
  onRetry?: (lastResult: PushStatusSummary) => void | Promise<void>;
}

export async function waitForDeployment(
  options: WaitForDeploymentOptions,
): Promise<PushStatusSummary> {
  const startTime = Date.now();
  const retryTimeoutMs = options.maxExecutionTime * 1000;

  let push = await pollUntilDeployed('preview', {
    options,
    startTime,
    retryTimeoutMs,
  });

  const shouldWaitForProdDeployment =
    push.isMainBranch && push.status.preview.deploy.status === 'success';

  if (shouldWaitForProdDeployment) {
    push = await pollUntilDeployed('production', {
      options,
      startTime,
      retryTimeoutMs,
    });
  }

  if (push.isOutdated || !push.hasChanges) {
    core.warning(
      `Files not added to your project. Reason: ${
        push.isOutdated ? 'outdated' : 'no changes'
      }.`,
    );
  }

  return toPushStatusSummary(push);
}

async function pollUntilDeployed(
  buildType: 'preview' | 'production',
  {
    options,
    startTime,
    retryTimeoutMs,
  }: {
    options: WaitForDeploymentOptions;
    startTime: number;
    retryTimeoutMs: number;
  },
): Promise<PushResponse> {
  const retryIntervalMs = options.retryIntervalMs ?? RETRY_INTERVAL_MS;

  for (;;) {
    const push = await fetchPushStatus(options);
    const deploymentStatus = push.status[buildType].deploy.status;

    if (!PENDING_DEPLOYMENT_STATUSES.includes(deploymentStatus)) {
      core.info(
        `The ${buildType} deployment finished with status "${deploymentStatus}". URL: ${
          push.status[buildType].deploy.url || 'no URL yet'
        }.`,
      );

      return push;
    }

    if (Date.now() - startTime > retryTimeoutMs) {
      throw new Error('Failed to get push status. Reason: Timeout exceeded.');
    }

    core.info(
      `Waiting for the ${buildType} deployment to finish. Current status: "${deploymentStatus}".`,
    );

    await pause(retryIntervalMs);
    await options.onRetry?.(toPushStatusSummary(push));
  }
}

export async function fetchPushStatus({
  domain,
  organization,
  project,
  pushId,
}: {
  domain: string;
  organization: string;
  project: string;
  pushId: string;
}): Promise<PushResponse> {
  const apiKey = process.env.REDOCLY_AUTHORIZATION;

  if (!apiKey) {
    throw new Error(
      'No api key provided, please use environment variable REDOCLY_AUTHORIZATION.',
    );
  }

  const response = await fetch(
    `${domain}/api/orgs/${encodeURIComponent(
      organization,
    )}/projects/${encodeURIComponent(project)}/pushes/${encodeURIComponent(
      pushId,
    )}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'user-agent': 'redocly-reunite-push-action',
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to get push status. Reason: ${response.statusText} (status: ${response.status}).`,
    );
  }

  return (await response.json()) as PushResponse;
}

function toPushStatusSummary(push: PushResponse): PushStatusSummary {
  return {
    preview: push.status.preview,
    production: push.isMainBranch ? push.status.production : null,
    commit: push.commit,
  };
}

async function pause(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
