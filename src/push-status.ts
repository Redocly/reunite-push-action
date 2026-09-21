import * as core from '@actions/core';
import {
  getApiKeys,
  waitForDeployment as waitForBuildDeployment,
  type BuildType,
  type PushResponse,
  type SunsetWarning,
} from '@redocly/reunite-integration';
import type { PushStatusSummary } from './types';

export interface WaitForDeploymentOptions {
  domain: string;
  organization: string;
  project: string;
  pushId: string;
  maxExecutionTime: number;
  retryIntervalMs?: number;
  onRetry?: (lastResult: PushStatusSummary) => void | Promise<void>;
  onSunsetWarning?: (warning: SunsetWarning) => void;
}

export async function waitForDeployment(
  options: WaitForDeploymentOptions,
): Promise<PushStatusSummary> {
  // One time budget for both deployments, the same way `redocly push-status --wait` counts it.
  const startTime = Date.now();
  const apiKey = getApiKeys();

  const waitFor = async (buildType: BuildType): Promise<PushResponse> => {
    let push: PushResponse;

    try {
      push = await waitForBuildDeployment({
        domain: options.domain,
        apiKey,
        organization: options.organization,
        project: options.project,
        pushId: options.pushId,
        buildType,
        maxExecutionTime: options.maxExecutionTime,
        retryIntervalMs: options.retryIntervalMs,
        startTime,
        onSunsetWarning: options.onSunsetWarning,
        onRetry: async pendingPush => {
          core.info(
            `Waiting for the ${buildType} deployment to finish. Current status: "${pendingPush.status[buildType].deploy.status}".`,
          );
          await options.onRetry?.(toPushStatusSummary(pendingPush));
        },
      });
    } catch (error: unknown) {
      throw new Error(
        `Failed to get push status. Reason: ${(error as Error).message}`,
      );
    }

    core.info(
      `The ${buildType} deployment finished with status "${push.status[buildType].deploy.status}". URL: ${
        push.status[buildType].deploy.url || 'no URL yet'
      }.`,
    );

    return push;
  };

  let push = await waitFor('preview');

  if (push.isMainBranch && push.status.preview.deploy.status === 'success') {
    push = await waitFor('production');
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

function toPushStatusSummary(push: PushResponse): PushStatusSummary {
  return {
    preview: push.status.preview,
    production: push.isMainBranch ? push.status.production : null,
    commit: push.commit,
  };
}
