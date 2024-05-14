import * as core from '@actions/core';
import { setCommitStatuses } from '../set-commit-statuses';

let getInputMock: jest.SpiedFunction<typeof core.getInput>;

const createCommitStatusMock = jest.fn().mockResolvedValue({});

jest.mock('@actions/github', () => ({
  ...jest.requireActual('@actions/github'),
  getOctokit: jest.fn().mockImplementation(() => ({
    rest: {
      repos: {
        createCommitStatus: createCommitStatusMock,
      },
    },
  })),
}));

describe('helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    getInputMock = jest.spyOn(core, 'getInput').mockImplementation();
  });

  describe('parseInputData', () => {
    it('should return parsed input data', async () => {
      await setCommitStatuses({
        commitStatuses: [
          {
            name: 'status-1',
            url: 'test-url-1',
            description: 'test-description-1',
            status: 'pending',
          },
          {
            name: 'status-2',
            url: 'test-url-2',
            description: 'test-description-2',
            status: 'running',
          },
          {
            name: 'status-3',
            url: 'test-url-3',
            description: 'test-description-3',
            status: 'success',
          },
          {
            name: 'status-4',
            url: 'test-url-4',
            description: 'test-description-4',
            status: 'failed',
          },
        ],
        owner: 'test-owner',
        repo: 'test-repo',
        commitId: 'test-commit-id',
      });

      expect(getInputMock).toHaveBeenCalledTimes(1);
      expect(createCommitStatusMock).toHaveBeenCalledTimes(4);

      expect(createCommitStatusMock).toHaveBeenNthCalledWith(1, {
        owner: 'test-owner',
        repo: 'test-repo',
        sha: 'test-commit-id',
        state: 'pending',
        target_url: 'test-url-1',
        context: 'status-1',
        description: 'test-description-1',
      });

      expect(createCommitStatusMock).toHaveBeenNthCalledWith(2, {
        owner: 'test-owner',
        repo: 'test-repo',
        sha: 'test-commit-id',
        state: 'pending',
        target_url: 'test-url-2',
        context: 'status-2',
        description: 'test-description-2',
      });

      expect(createCommitStatusMock).toHaveBeenNthCalledWith(3, {
        owner: 'test-owner',
        repo: 'test-repo',
        sha: 'test-commit-id',
        state: 'success',
        target_url: 'test-url-3',
        context: 'status-3',
        description: 'test-description-3',
      });

      expect(createCommitStatusMock).toHaveBeenNthCalledWith(4, {
        owner: 'test-owner',
        repo: 'test-repo',
        sha: 'test-commit-id',
        state: 'error',
        target_url: 'test-url-4',
        context: 'status-4',
        description: 'test-description-4',
      });
    });
  });
});
