import * as core from '@actions/core';
import { parseInputData, parseEventData, getRedoclyConfig } from '../helpers';
import { loadConfig } from '@redocly/openapi-core';
import { Context } from '@actions/github/lib/context';

let getInputMock: jest.SpiedFunction<typeof core.getInput>;

function getPushEventContext(): Partial<Context> {
  return {
    eventName: 'push',
    payload: {
      repository: {
        owner: {
          login: 'test-namespace',
        },
        name: 'test-repo',
        default_branch: 'test-default-branch',
      },
      after: 'test-commit-sha',
    },
    ref: 'refs/heads/test-branch',
  };
}

jest.mock('@actions/github', () => ({
  ...jest.requireActual('@actions/github'),
  context: getPushEventContext(),
  getOctokit: jest.fn().mockImplementation(() => ({
    rest: {
      repos: {
        getCommit: jest.fn().mockImplementation(() => ({
          data: {
            html_url: 'test-commit-html-url',
            commit: {
              message: 'test-commit-message',
              author: {
                name: 'test-commit-author-name',
                email: 'test-commit-author-email',
                date: 'test-commit-created-at',
              },
            },
          },
        })),
      },
    },
  })),
}));

describe('helpers', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = {
      ...OLD_ENV,
      GITHUB_WORKSPACE: '/home/runner/work/reunite-push-action/',
    };
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation();
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  describe('parseInputData', () => {
    it('should return parsed input data', () => {
      getInputMock.mockImplementation(
        getGetInputMock({
          organization: 'test-org-slug',
          project: 'test-project-slug',
          domain: 'redocly-domain.com',
          files: 'testFolder testOpenApiFile.yaml',
          mountPath: 'test/mount/path',
          maxExecutionTime: '100',
        }),
      );
      const parsedInputData = parseInputData();

      expect(getInputMock).toHaveBeenCalledTimes(6);
      expect(parsedInputData).toEqual({
        redoclyOrgSlug: 'test-org-slug',
        redoclyProjectSlug: 'test-project-slug',
        redoclyDomain: 'redocly-domain.com',
        files: [
          '/home/runner/work/reunite-push-action/testFolder',
          '/home/runner/work/reunite-push-action/testOpenApiFile.yaml',
        ],
        mountPath: 'test/mount/path',
        maxExecutionTime: 100,
      });
    });
  });

  describe('parseEventData', () => {
    it('should return parsed GitHub event data', async () => {
      const parsedEventData = await parseEventData();

      expect(parsedEventData).toEqual({
        eventName: 'push',
        namespace: 'test-namespace',
        repository: 'test-repo',
        branch: 'test-branch',
        defaultBranch: 'test-default-branch',
        commit: {
          commitSha: 'test-commit-sha',
          commitMessage: 'test-commit-message',
          commitUrl: 'test-commit-html-url',
          commitAuthor: 'test-commit-author-name <test-commit-author-email>',
          commitCreatedAt: 'test-commit-created-at',
        },
      });
    });
  });

  describe('getRedoclyConfig', () => {
    it('should return redocly config', async () => {
      const redoclyConfig = await getRedoclyConfig();
      expect(typeof redoclyConfig).toBe(typeof loadConfig({}));
    });
  });
});

function getGetInputMock(mockInput: { [key: string]: string }) {
  return (name: string) => {
    return mockInput[name] || '';
  };
}
