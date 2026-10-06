import express from 'express';

const app = express();
const port = 3000;

const stubResponseStatus = {
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

// The push resolves the organization and project inputs to ids with this lookup.
app.get(/\/orgs\/[^/]+\/projects\/[^/]+$/, (req, res) => {
  res.json({
    id: 'prj_01hksn7dhbmf3nby0aeax6bkvf',
    slug: 'ci-test-project',
    name: 'CI test project',
    uri: `http://localhost:${port}/api/orgs/org_01hksn7dgmb6jpak0tzzepreq1/projects/prj_01hksn7dhbmf3nby0aeax6bkvf`,
  });
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
