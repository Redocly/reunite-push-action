import * as core from '@actions/core';
import {
  collectFilesToPush,
  getApiKeys,
  pushFiles,
} from '@redocly/reunite-integration';
import type { UpsertRemoteResponse } from '@redocly/reunite-integration';

import { pushToReunite } from '../push';
import { parsedEventPushDataMock, parsedInputDataStub } from './fixtures';

const collectFilesToPushMock = jest.mocked(collectFilesToPush);
const pushFilesMock = jest.mocked(pushFiles);

const collectedFiles = [
  { name: 'openapi.yaml', path: '/workspace/openapi.yaml' },
  { name: 'docs/index.md', path: '/workspace/docs/index.md' },
];

describe('push', () => {
  let infoMock: jest.SpiedFunction<typeof core.info>;

  beforeEach(() => {
    jest.mocked(getApiKeys).mockReturnValue('test-api-key');
    collectFilesToPushMock.mockReturnValue(collectedFiles);
    pushFilesMock.mockResolvedValue({ pushId: 'test-push-id' });
    infoMock = jest.spyOn(core, 'info').mockImplementation();
  });

  it('pushes the collected files with the commit details and resolves with the push id', async () => {
    const pushId = await pushToReunite({
      inputData: parsedInputDataStub,
      ghEvent: parsedEventPushDataMock,
    });

    expect(pushId).toBe('test-push-id');
    expect(collectFilesToPushMock).toHaveBeenCalledWith(
      parsedInputDataStub.files,
    );
    expect(pushFilesMock).toHaveBeenCalledWith({
      domain: parsedInputDataStub.redoclyDomain,
      apiKey: 'test-api-key',
      organization: parsedInputDataStub.redoclyOrgSlug,
      project: parsedInputDataStub.redoclyProjectSlug,
      mountPath: parsedInputDataStub.mountPath,
      files: collectedFiles,
      defaultBranch: parsedEventPushDataMock.defaultBranch,
      commit: {
        message: parsedEventPushDataMock.commit.commitMessage,
        branchName: parsedEventPushDataMock.branch,
        author: parsedEventPushDataMock.commit.commitAuthor,
        sha: parsedEventPushDataMock.commit.commitSha,
        url: parsedEventPushDataMock.commit.commitUrl,
        createdAt: parsedEventPushDataMock.commit.commitCreatedAt,
        namespace: parsedEventPushDataMock.namespace,
        repository: parsedEventPushDataMock.repository,
      },
      onUploadStart: expect.any(Function),
    });
    expect(infoMock).toHaveBeenCalledWith('Push ID: test-push-id');
  });

  it('logs the upload target and the files once the remote is ready', async () => {
    await pushToReunite({
      inputData: parsedInputDataStub,
      ghEvent: parsedEventPushDataMock,
    });

    const { onUploadStart } = pushFilesMock.mock.calls[0][0];
    onUploadStart?.({ mountPath: 'test/mount/path' } as UpsertRemoteResponse);

    expect(infoMock).toHaveBeenCalledWith(
      'Uploading 2 file(s) to test/mount/path:',
    );
    expect(infoMock).toHaveBeenCalledWith('  openapi.yaml');
    expect(infoMock).toHaveBeenCalledWith('  docs/index.md');
  });

  it('rejects when there are no files to upload', async () => {
    collectFilesToPushMock.mockReturnValue([]);

    await expect(
      pushToReunite({
        inputData: parsedInputDataStub,
        ghEvent: parsedEventPushDataMock,
      }),
    ).rejects.toThrow('No files to upload.');
    expect(pushFilesMock).not.toHaveBeenCalled();
  });

  it('rejects with the Reunite error when the push fails', async () => {
    pushFilesMock.mockRejectedValue(
      new Error('Failed to fetch default branch. Unauthorized.'),
    );

    await expect(
      pushToReunite({
        inputData: parsedInputDataStub,
        ghEvent: parsedEventPushDataMock,
      }),
    ).rejects.toThrow('Failed to fetch default branch. Unauthorized.');
  });
});
