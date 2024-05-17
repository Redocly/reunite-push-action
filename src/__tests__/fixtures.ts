import { PushStatusSummary } from '@redocly/cli/lib/cms/commands/push-status';
import { ParsedEventData, ParsedInputData } from '../types';

export const parsedInputDataStub: ParsedInputData = {
  redoclyOrgSlug: 'test-org-slug',
  redoclyProjectSlug: 'test-project-slug',
  redoclyDomain: 'redocly-domain.com',
  files: ['test'],
  mountPath: 'test/mount/path',
  maxExecutionTime: 100,
};

export const parsedEventPushDataMock: ParsedEventData = {
  eventName: 'push',
  namespace: 'test-namespace',
  repository: 'test-repo',
  branch: 'test-branch',
  defaultBranch: 'test-default-branch',
  commit: {
    commitSha: 'test-commit-sha',
    commitMessage: 'test-commit-message',
    commitUrl: 'test-commit-url',
    commitAuthor: 'test-commit-author',
    commitCreatedAt: 'test-commit-created-at',
  },
};

export const pushStatusSummaryStub: PushStatusSummary = {
  preview: {
    deploy: {
      status: 'success',
      url: 'test-url',
    },
    scorecard: [],
  },
  production: null,
  commit: {
    branchName: 'test-branch-name',
    message: 'test-commit-message',
    createdAt: 'test-created-at',
    namespaceId: null,
    repositoryId: null,
    url: null,
    sha: null,
    author: {
      name: 'Test Author Name',
      email: 'test-author-email',
      image: null,
    },
    statuses: [
      {
        name: 'Test Status Name',
        description: 'Test Status Description',
        status: 'success',
        url: null,
      },
    ],
  },
};
