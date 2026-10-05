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

const pushResultStub = {
  pushId: 'test-push-id',
  organizationId: 'org_01hksn7dgmb6jpak0tzzepreq1',
  projectId: 'prj_01hksn7dhbmf3nby0aeax6bkvf',
};

const collectedFiles = [
  { name: 'openapi.yaml', path: '/workspace/openapi.yaml' },
  { name: 'docs/index.md', path: '/workspace/docs/index.md' },
];

describe('push', () => {
  let infoMock: jest.SpiedFunction<typeof core.info>;

  beforeEach(() => {
    jest.mocked(getApiKeys).mockReturnValue('test-api-key');
    collectFilesToPushMock.mockReturnValue(collectedFiles);
    pushFilesMock.mockResolvedValue(pushResultStub);
    infoMock = jest.spyOn(core, 'info').mockImplementation();
  });

  it('pushes the collected files with the commit details and resolves with the push and the ids', async () => {
    const push = await pushToReunite({
      inputData: parsedInputDataStub,
      ghEvent: parsedEventPushDataMock,
    });

    expect(push).toEqual(pushResultStub);
    expect(collectFilesToPushMock).toHaveBeenCalledWith(
      parsedInputDataStub.files,
      expect.any(Function),
    );
    expect(pushFilesMock).toHaveBeenCalledWith({
      domain: parsedInputDataStub.redoclyDomain,
      apiKey: 'test-api-key',
      organization: parsedInputDataStub.organization,
      project: parsedInputDataStub.project,
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
      onSlugDeprecated: expect.any(Function),
    });
    expect(infoMock).toHaveBeenCalledWith('Push ID: test-push-id');
  });

  it('warns with the ids when the organization or project input is a slug', async () => {
    const warningMock = jest.spyOn(core, 'warning').mockImplementation();
    pushFilesMock.mockImplementation(async ({ onSlugDeprecated }) => {
      onSlugDeprecated?.(pushResultStub);
      return pushResultStub;
    });

    await pushToReunite({
      inputData: parsedInputDataStub,
      ghEvent: parsedEventPushDataMock,
    });

    expect(warningMock).toHaveBeenCalledWith(
      'Organization and project slugs are deprecated. Use the IDs in the action inputs instead: organization: org_01hksn7dgmb6jpak0tzzepreq1, project: prj_01hksn7dhbmf3nby0aeax6bkvf.',
    );
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

  it('warns when a later path overwrites an earlier file', async () => {
    const warningMock = jest.spyOn(core, 'warning').mockImplementation();
    collectFilesToPushMock.mockImplementation((_paths, onFileOverwritten) => {
      onFileOverwritten?.(
        '/workspace/a/openapi.yaml',
        '/workspace/b/openapi.yaml',
      );
      return collectedFiles;
    });

    await pushToReunite({
      inputData: parsedInputDataStub,
      ghEvent: parsedEventPushDataMock,
    });

    expect(warningMock).toHaveBeenCalledWith(
      'File /workspace/a/openapi.yaml is overwritten by /workspace/b/openapi.yaml',
    );
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
