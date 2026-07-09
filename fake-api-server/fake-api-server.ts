import express from 'express';

const app = express();
const port = 3000;

// Keep in sync with the PushResponse type in src/types.ts. It is declared
// locally because this file is compiled by its own tsconfig that only
// includes the fake-api-server directory.
type FakePushResponse = {
  id: string;
  remoteId: string;
  isMainBranch: boolean;
  isOutdated: boolean;
  hasChanges: boolean;
  replace: boolean;
  scoutJobId: string | null;
  uploadedFiles: Array<{ path: string; mimeType: string }>;
  commit: {
    branchName: string;
    message: string;
    createdAt: string | null;
    namespaceId: string | null;
    repositoryId: string | null;
    url: string | null;
    sha: string | null;
    author: {
      name: string;
      email: string;
      image: string | null;
    };
    statuses: Array<{
      name: string;
      description: string;
      status: 'pending' | 'running' | 'success' | 'failed';
      url: string | null;
    }>;
  };
  remote: { commits: { sha: string; branchName: string }[] };
  status: {
    preview: FakeDeploymentStatus;
    production: FakeDeploymentStatus;
  };
};

type FakeDeploymentStatus = {
  scorecard: [];
  deploy: {
    url: string | null;
    status: 'pending' | 'running' | 'success' | 'failed';
  };
};

const stubResponseStatus: FakePushResponse = {
  id: 'test-push-id',
  remoteId: 'test-remote-id',
  replace: false,
  scoutJobId: null,
  uploadedFiles: [],
  commit: {
    message: 'test-commit-message',
    branchName: 'test-branch-name',
    createdAt: null,
    namespaceId: 'test-namespace-id',
    repositoryId: 'test-repository-id',
    sha: 'test-sha',
    url: 'https://test-commit-url',
    author: {
      name: 'test-author-name',
      email: 'test-author-email',
      image: null,
    },
    statuses: [
      {
        name: 'CI / Action smoke test [commit status]',
        description: 'Status, which is set by action',
        status: 'success',
        url: 'https://redocly.com/',
      },
    ],
  },
  remote: { commits: [] },
  isOutdated: false,
  isMainBranch: true,
  hasChanges: true,
  status: {
    preview: {
      scorecard: [],
      deploy: {
        url: 'https://preview-test-url',
        status: 'success',
      },
    },
    production: {
      scorecard: [],
      deploy: {
        url: 'https://production-test-url',
        status: 'success',
      },
    },
  },
};

// Report a running preview deployment on the first status poll so the action
// exercises its retry loop (including intermediate commit statuses).
let pushStatusRequestCount = 0;

app.get(/\/pushes\/[^/]+$/, (req, res) => {
  pushStatusRequestCount++;

  if (pushStatusRequestCount === 1) {
    res.json({
      ...stubResponseStatus,
      status: {
        ...stubResponseStatus.status,
        preview: {
          scorecard: [],
          deploy: { url: null, status: 'running' },
        },
      },
    });
    return;
  }

  res.json(stubResponseStatus);
});

app.get('*', (req, res) => {
  res.json(stubResponseStatus);
});

app.post('*', (req, res) => {
  res.json({
    id: 'test-push-id',
    mountPath: 'test-mount-path',
  });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Fake server listening on port ${port}`);
});
