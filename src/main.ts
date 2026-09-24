import * as core from '@actions/core';
import type { SunsetWarning } from '@redocly/reunite-integration';

import { setCommitStatuses } from './set-commit-statuses';
import { parseEventData, parseInputData, setClientMarker } from './helpers';
import { pushToReunite } from './push';
import { waitForDeployment } from './push-status';
import { reportSunsetWarning } from './sunset-warning';
import type { PushStatusSummary } from './types';

export async function run(): Promise<void> {
  // Any Reunite request may carry a sunset warning; it is reported once, even when the run fails.
  const sunsetWarnings: SunsetWarning[] = [];
  const onSunsetWarning = (warning: SunsetWarning): void => {
    sunsetWarnings.push(warning);
  };

  try {
    setClientMarker();

    const inputData = parseInputData();
    const ghEvent = await parseEventData(inputData.defaultBranch);

    console.debug('Parsed input data', inputData);
    console.debug('Parsed GitHub event', ghEvent);

    const pushId = await pushToReunite({ inputData, ghEvent, onSunsetWarning });

    const pushStatusData = await waitForDeployment({
      domain: inputData.redoclyDomain,
      organization: inputData.redoclyOrgSlug,
      project: inputData.redoclyProjectSlug,
      pushId,
      maxExecutionTime: inputData.maxExecutionTime,
      onSunsetWarning,
      onRetry: async (lastResult: PushStatusSummary) => {
        try {
          await setCommitStatuses({
            commitStatuses: lastResult.commit.statuses,
            owner: ghEvent.namespace,
            repo: ghEvent.repository,
            commitId: ghEvent.commit.commitSha,
          });
        } catch (error: unknown) {
          core.error(
            `Failed to set commit statuses. Error: ${(error as Error)?.message}`,
          );
        }
      },
    });

    console.debug(
      'Amount of final commit statuses to set',
      pushStatusData.commit.statuses.length,
    );

    await setCommitStatuses({
      commitStatuses: pushStatusData.commit.statuses,
      owner: ghEvent.namespace,
      repo: ghEvent.repository,
      commitId: ghEvent.commit.commitSha,
    });

    console.debug('Action finished successfully. Push ID:', pushId);

    core.setOutput('pushId', pushId);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  } finally {
    reportSunsetWarning(sunsetWarnings);
  }
}
