import * as core from '@actions/core';
import {
  collectFilesToPush,
  getApiKeys,
  pushFiles,
  type ProjectRefResolution,
  type PushResult,
  type SunsetWarning,
} from '@redocly/reunite-integration';
import type { ParsedEventData, ParsedInputData } from './types';

export async function pushToReunite({
  inputData,
  ghEvent,
  onSunsetWarning,
}: {
  inputData: ParsedInputData;
  ghEvent: ParsedEventData;
  onSunsetWarning?: (warning: SunsetWarning) => void;
}): Promise<PushResult> {
  const files = collectFilesToPush(
    inputData.files,
    (existingPath, replacementPath) => {
      core.warning(`File ${existingPath} is overwritten by ${replacementPath}`);
    },
  );

  if (files.length === 0) {
    throw new Error('No files to upload.');
  }

  const push = await pushFiles({
    domain: inputData.redoclyDomain,
    apiKey: getApiKeys(),
    organization: inputData.organization,
    project: inputData.project,
    mountPath: inputData.mountPath,
    files,
    defaultBranch: ghEvent.defaultBranch,
    commit: {
      message: ghEvent.commit.commitMessage,
      branchName: ghEvent.branch,
      author: ghEvent.commit.commitAuthor,
      sha: ghEvent.commit.commitSha,
      url: ghEvent.commit.commitUrl,
      createdAt: ghEvent.commit.commitCreatedAt,
      namespace: ghEvent.namespace,
      repository: ghEvent.repository,
    },
    onUploadStart: remote => {
      core.info(`Uploading ${files.length} file(s) to ${remote.mountPath}:`);
      for (const file of files) {
        core.info(`  ${file.name}`);
      }
    },
    onSunsetWarning,
    onSlugDeprecated: reportSlugDeprecation,
  });

  core.info(`Push ID: ${push.pushId}`);

  return push;
}

function reportSlugDeprecation({
  organizationId,
  projectId,
}: ProjectRefResolution): void {
  core.warning(
    `Organization and project slugs are deprecated. Use the IDs in the action inputs instead: organization: ${organizationId}, project: ${projectId}.`,
  );
}
