import type { PushResponse } from '../types';
import { fetchPushStatus, waitForDeployment } from '../push-status';
import { pushResponseStub } from './fixtures';

const fetchMock = jest.fn();

const waitForDeploymentOptions = {
  domain: 'https://redocly-domain.com',
  organization: 'test-org-slug',
  project: 'test-project-slug',
  pushId: 'test-push-id',
  maxExecutionTime: 100,
  retryIntervalMs: 0,
};

function mockPushResponse(push: PushResponse): void {
  fetchMock.mockResolvedValueOnce({
    ok: true,
    json: async () => push,
  });
}

describe('push-status', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();

    global.fetch = fetchMock;
    process.env = { ...OLD_ENV, REDOCLY_AUTHORIZATION: 'test-api-key' };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe('fetchPushStatus', () => {
    it('should request the push status with authorization header', async () => {
      mockPushResponse(pushResponseStub);

      const push = await fetchPushStatus(waitForDeploymentOptions);

      expect(fetchMock).toHaveBeenCalledWith(
        'https://redocly-domain.com/api/orgs/test-org-slug/projects/test-project-slug/pushes/test-push-id',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-api-key',
          }),
        }),
      );
      expect(push).toEqual(pushResponseStub);
    });

    it('should throw when REDOCLY_AUTHORIZATION is not set', async () => {
      delete process.env.REDOCLY_AUTHORIZATION;

      await expect(fetchPushStatus(waitForDeploymentOptions)).rejects.toThrow(
        'No api key provided, please use environment variable REDOCLY_AUTHORIZATION.',
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('should throw on a non-ok API response', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(fetchPushStatus(waitForDeploymentOptions)).rejects.toThrow(
        'Failed to get push status. Reason: Not Found (status: 404).',
      );
    });
  });

  describe('waitForDeployment', () => {
    it('should return the summary for a finished non-main-branch push', async () => {
      mockPushResponse(pushResponseStub);

      const summary = await waitForDeployment(waitForDeploymentOptions);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(summary).toEqual({
        preview: pushResponseStub.status.preview,
        production: null,
        commit: pushResponseStub.commit,
      });
    });

    it('should poll while the preview deployment is running and call onRetry', async () => {
      const runningPush: PushResponse = {
        ...pushResponseStub,
        status: {
          ...pushResponseStub.status,
          preview: {
            deploy: { status: 'running', url: null },
            scorecard: [],
          },
        },
      };
      mockPushResponse(runningPush);
      mockPushResponse(pushResponseStub);

      const onRetry = jest.fn();

      const summary = await waitForDeployment({
        ...waitForDeploymentOptions,
        onRetry,
      });

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith({
        preview: runningPush.status.preview,
        production: null,
        commit: runningPush.commit,
      });
      expect(summary.preview.deploy.status).toBe('success');
    });

    it('should wait for the production deployment on the main branch', async () => {
      const mainBranchPush: PushResponse = {
        ...pushResponseStub,
        isMainBranch: true,
        status: {
          preview: {
            deploy: { status: 'success', url: 'test-url' },
            scorecard: [],
          },
          production: {
            deploy: { status: 'running', url: null },
            scorecard: [],
          },
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
      // Preview poll resolves right away, production needs one retry.
      mockPushResponse(mainBranchPush);
      mockPushResponse(mainBranchPush);
      mockPushResponse(deployedMainBranchPush);

      const summary = await waitForDeployment(waitForDeploymentOptions);

      expect(fetchMock).toHaveBeenCalledTimes(3);
      expect(summary).toEqual({
        preview: deployedMainBranchPush.status.preview,
        production: deployedMainBranchPush.status.production,
        commit: deployedMainBranchPush.commit,
      });
    });

    it('should not wait for the production deployment when the preview failed', async () => {
      const failedMainBranchPush: PushResponse = {
        ...pushResponseStub,
        isMainBranch: true,
        status: {
          ...pushResponseStub.status,
          preview: {
            deploy: { status: 'failed', url: null },
            scorecard: [],
          },
        },
      };
      mockPushResponse(failedMainBranchPush);

      const summary = await waitForDeployment(waitForDeploymentOptions);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(summary.preview.deploy.status).toBe('failed');
      expect(summary.production).toEqual(
        failedMainBranchPush.status.production,
      );
    });

    it('should throw when the deployment does not finish in time', async () => {
      const runningPush: PushResponse = {
        ...pushResponseStub,
        status: {
          ...pushResponseStub.status,
          preview: {
            deploy: { status: 'running', url: null },
            scorecard: [],
          },
        },
      };
      mockPushResponse(runningPush);

      const dateNowMock = jest
        .spyOn(Date, 'now')
        .mockReturnValueOnce(0)
        .mockReturnValue(waitForDeploymentOptions.maxExecutionTime * 1000 + 1);

      await expect(waitForDeployment(waitForDeploymentOptions)).rejects.toThrow(
        'Failed to get push status. Reason: Timeout exceeded.',
      );

      dateNowMock.mockRestore();
    });
  });
});
