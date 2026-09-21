import * as core from '@actions/core';
import {
  collectFilesToPush,
  getApiKeys,
  pushFiles,
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
}): Promise<string> {
  const files = collectFilesToPush(inputData.files);

  if (files.length === 0) {
    throw new Error('No files to upload.');
  }

  const { pushId } = await pushFiles({
    domain: inputData.redoclyDomain,
    apiKey: getApiKeys(),
    organization: inputData.redoclyOrgSlug,
    project: inputData.redoclyProjectSlug,
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
  });

  core.info(`Push ID: ${pushId}`);

  return pushId;
}
