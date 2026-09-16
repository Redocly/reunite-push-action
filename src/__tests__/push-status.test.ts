import * as core from '@actions/core';
import {
  getApiKeys,
  waitForDeployment as waitForBuildDeployment,
} from '@redocly/reunite-integration';

import type { PushResponse } from '../types';
import { waitForDeployment } from '../push-status';
import { pushResponseStub } from './fixtures';

const waitForBuildDeploymentMock = jest.mocked(waitForBuildDeployment);

const waitForDeploymentOptions = {
  domain: 'https://redocly-domain.com',
  organization: 'test-org-slug',
  project: 'test-project-slug',
  pushId: 'test-push-id',
  maxExecutionTime: 100,
  retryIntervalMs: 0,
};

const runningPush: PushResponse = {
  ...pushResponseStub,
  status: {
    ...pushResponseStub.status,
    preview: { deploy: { status: 'running', url: null }, scorecard: [] },
  },
};

describe('push-status', () => {
  let infoMock: jest.SpiedFunction<typeof core.info>;
  let warningMock: jest.SpiedFunction<typeof core.warning>;

  beforeEach(() => {
    jest.mocked(getApiKeys).mockReturnValue('test-api-key');
    waitForBuildDeploymentMock.mockResolvedValue(pushResponseStub);
    infoMock = jest.spyOn(core, 'info').mockImplementation();
    warningMock = jest.spyOn(core, 'warning').mockImplementation();
  });

  it('waits for the preview deployment and returns the summary', async () => {
    const summary = await waitForDeployment(waitForDeploymentOptions);

    expect(waitForBuildDeploymentMock).toHaveBeenCalledTimes(1);
    expect(waitForBuildDeploymentMock).toHaveBeenCalledWith({
      domain: waitForDeploymentOptions.domain,
      apiKey: 'test-api-key',
      organization: waitForDeploymentOptions.organization,
      project: waitForDeploymentOptions.project,
      pushId: waitForDeploymentOptions.pushId,
      buildType: 'preview',
      maxExecutionTime: waitForDeploymentOptions.maxExecutionTime,
      retryIntervalMs: waitForDeploymentOptions.retryIntervalMs,
      startTime: expect.any(Number),
      onRetry: expect.any(Function),
    });
    expect(infoMock).toHaveBeenCalledWith(
      'The preview deployment finished with status "success". URL: test-url.',
    );
    expect(summary).toEqual({
      preview: pushResponseStub.status.preview,
      production: null,
      commit: pushResponseStub.commit,
    });
  });

  it('reports each pending status to onRetry as a summary', async () => {
    waitForBuildDeploymentMock.mockImplementation(async ({ onRetry }) => {
      await onRetry?.(runningPush);
      return pushResponseStub;
    });
    const onRetry = jest.fn();

    await waitForDeployment({ ...waitForDeploymentOptions, onRetry });

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith({
      preview: runningPush.status.preview,
      production: null,
      commit: runningPush.commit,
    });
    expect(infoMock).toHaveBeenCalledWith(
      'Waiting for the preview deployment to finish. Current status: "running".',
    );
  });

  it('waits for the production deployment on the main branch', async () => {
    const mainBranchPush: PushResponse = {
      ...pushResponseStub,
      isMainBranch: true,
      status: {
        preview: {
          deploy: { status: 'success', url: 'test-url' },
          scorecard: [],
        },
        production: { deploy: { status: 'running', url: null }, scorecard: [] },
      },
    };
    const deployedMainBranchPush: PushResponse = {
      ...mainBranchPush,
      status: {
        ...mainBranchPush.status,
        production: {
          deploy: { status: 'success', url: 'test-production-url' },
          scorecard: [],
        },
      },
    };
    waitForBuildDeploymentMock
      .mockResolvedValueOnce(mainBranchPush)
      .mockResolvedValueOnce(deployedMainBranchPush);

    const summary = await waitForDeployment(waitForDeploymentOptions);

    expect(waitForBuildDeploymentMock).toHaveBeenCalledTimes(2);
    expect(waitForBuildDeploymentMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ buildType: 'production' }),
    );
    const [[previewOptions], [productionOptions]] =
      waitForBuildDeploymentMock.mock.calls;
    expect(productionOptions.startTime).toBe(previewOptions.startTime);
    expect(summary).toEqual({
      preview: deployedMainBranchPush.status.preview,
      production: deployedMainBranchPush.status.production,
      commit: deployedMainBranchPush.commit,
    });
  });

  it('does not wait for the production deployment when the preview failed', async () => {
    const failedMainBranchPush: PushResponse = {
      ...pushResponseStub,
      isMainBranch: true,
      status: {
        ...pushResponseStub.status,
        preview: { deploy: { status: 'failed', url: null }, scorecard: [] },
      },
    };
    waitForBuildDeploymentMock.mockResolvedValue(failedMainBranchPush);

    const summary = await waitForDeployment(waitForDeploymentOptions);

    expect(waitForBuildDeploymentMock).toHaveBeenCalledTimes(1);
    expect(summary.preview.deploy.status).toBe('failed');
    expect(summary.production).toEqual(failedMainBranchPush.status.production);
  });

  it('warns when the push has no changes', async () => {
    waitForBuildDeploymentMock.mockResolvedValue({
      ...pushResponseStub,
      hasChanges: false,
    });

    await waitForDeployment(waitForDeploymentOptions);

    expect(warningMock).toHaveBeenCalledWith(
      'Files not added to your project. Reason: no changes.',
    );
  });

  it('rejects when the deployment does not finish in time', async () => {
    waitForBuildDeploymentMock.mockRejectedValue(
      new Error('Timeout exceeded.'),
    );

    await expect(waitForDeployment(waitForDeploymentOptions)).rejects.toThrow(
      'Failed to get push status. Reason: Timeout exceeded.',
    );
  });

  it('rejects when REDOCLY_AUTHORIZATION is not set', async () => {
    jest.mocked(getApiKeys).mockImplementation(() => {
      throw new Error(
        'No api key provided, please use environment variable REDOCLY_AUTHORIZATION.',
      );
    });

    await expect(waitForDeployment(waitForDeploymentOptions)).rejects.toThrow(
      'No api key provided, please use environment variable REDOCLY_AUTHORIZATION.',
    );
    expect(waitForBuildDeploymentMock).not.toHaveBeenCalled();
  });
});
