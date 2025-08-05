import * as core from '@actions/core';
import * as github from '@actions/github';
import { parseInputData, parseEventData, getRedoclyConfig } from '../helpers';
import { loadConfig } from '@redocly/openapi-core';
import { WebhookPayload } from '@actions/github/lib/interfaces';

let getInputMock: jest.SpiedFunction<typeof core.getInput>;

jest.mock('@actions/github', () => ({
  ...jest.requireActual('@actions/github'),
  context: {
    repo: {
      owner: '',
      repo: 'test-repo',
    },
    issue: {
      owner: 'test-namespace',
      repo: 'test-repo-name',
      number: 1,
    },
  },
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

const OLD_ENV = process.env;

describe('helpers', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    // NOTE: The 'context' object cannot be mocked using jest.spyOn because it is not declared as configurable.
    // As a result, we manually set its properties in the test setup.
    github.context.eventName = 'push';
    github.context.action = '';
    github.context.payload = createPayloadMock({});
    github.context.ref = 'refs/heads/test-branch';
    github.context.sha = '';
    github.context.actor = '';
    github.context.job = '';
    github.context.runNumber = 1;
    github.context.runId = 1;
    github.context.apiUrl = '';
    github.context.serverUrl = '';
    github.context.graphqlUrl = '';
    github.context.workflow = '';

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
    it('should return parsed GitHub push event data', async () => {
      github.context.eventName = 'push';
      github.context.payload = createPayloadMock({
        after: 'test-commit-sha',
      });
      github.context.ref = 'refs/heads/test-branch';

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

    it.each(['opened', 'reopened', 'synchronize'])(
      `should return parsed GitHub PR event data for "%s" action`,
      async action => {
        github.context.eventName = 'pull_request';
        github.context.payload = createPayloadMock({
          action,
          pull_request: {
            number: 1,
            head: {
              sha: 'test-pr-head-sha',
              ref: 'test-pr-branch',
            },
          },
        });
        github.context.ref = 'refs/pull/1/merge';

        const parsedEventData = await parseEventData();

        expect(parsedEventData).toEqual({
          eventName: 'pull_request',
          namespace: 'test-namespace',
          repository: 'test-repo',
          branch: 'test-pr-branch',
          defaultBranch: 'test-default-branch',
          commit: {
            commitSha: 'test-pr-head-sha',
            commitMessage: 'test-commit-message',
            commitUrl: 'test-commit-html-url',
            commitAuthor: 'test-commit-author-name <test-commit-author-email>',
            commitCreatedAt: 'test-commit-created-at',
          },
        });
      },
    );

    it('should throw error for unsupported event types', async () => {
      github.context.eventName = 'issues';
      github.context.ref = 'refs/pull/1/merge';

      await expect(parseEventData()).rejects.toThrow(
        'Unsupported GitHub event type. Only "push" and "pull_request" events are supported.',
      );
    });

    it('should throw error when repository info is missing', async () => {
      github.context.eventName = 'push';
      github.context.payload = createPayloadMock({
        repository: undefined,
      });

      await expect(parseEventData()).rejects.toThrow(
        'Invalid GitHub event data. Can not get owner or repository name from the event payload.',
      );
    });

    it('should throw error when branch info is missing', async () => {
      github.context.eventName = 'push';
      github.context.payload = createPayloadMock({});
      github.context.ref = '';

      await expect(parseEventData()).rejects.toThrow(
        'Invalid GitHub event data. Can not get branch from the event payload.',
      );
    });

    it('should throw error when default branch is missing', async () => {
      github.context.eventName = 'push';
      github.context.payload = createPayloadMock({
        repository: {
          owner: {
            login: 'test-namespace',
          },
          name: 'test-repo',
          default_branch: undefined,
          master_branch: undefined,
        },
      });

      await expect(parseEventData()).rejects.toThrow(
        'Invalid GitHub event data. Can not get default branch from the event payload.',
      );
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

const createPayloadMock = (
  payload: Partial<WebhookPayload>,
): WebhookPayload => {
  return {
    repository: {
      owner: {
        login: 'test-namespace',
      },
      name: 'test-repo',
      default_branch: 'test-default-branch',
    },
    ...payload,
  };
};
