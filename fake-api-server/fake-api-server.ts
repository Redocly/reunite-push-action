import express from 'express';
import { PushResponse } from '@redocly/cli/lib/cms/api/types';

const app = express();
const port = 3000;

const stubResponseStatus: PushResponse = {
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
      image: null
    },
    statuses: [
      {
        name: 'CI / Action smoke test [commit status]',
        description: 'Status, which is set by action',
        status: 'success',
        url: 'https://redocly.com/'
      }
    ]
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
        status: 'success'
      }
    },
    production: {
      scorecard: [],
      deploy: {
        url: 'https://production-test-url',
        status: 'success'
      }
    }
  }
};

app.get('*', (req, res) => {
  res.json(stubResponseStatus);
});

app.post('*', (req, res) => {
  res.json({
    id: 'test-push-id',
    mountPath: 'test-mount-path'
  });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Fake server listening on port ${port}`);
});
