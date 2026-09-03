export interface ParsedInputData {
  redoclyOrgSlug: string;
  redoclyProjectSlug: string;
  redoclyDomain: string;
  files: string[];
  mountPath: string;
  maxExecutionTime: number;
  defaultBranch?: string;
}

export interface ParsedEventData {
  eventName: string;
  namespace: string;
  repository: string;
  branch: string;
  defaultBranch: string;
  commit: {
    commitSha: string;
    commitMessage: string;
    commitUrl: string;
    commitAuthor: string;
    commitCreatedAt?: string;
  };
}

// Shape of the Reunite API push response.
export type PushStatusBase = 'pending' | 'success' | 'running' | 'failed';

export type DeploymentStatus = 'skipped' | PushStatusBase;

export type ScorecardItem = {
  name: string;
  status: PushStatusBase;
  description: string;
  url: string;
};

export type DeploymentStatusResponse = {
  deploy: {
    url: string | null;
    status: DeploymentStatus;
  };
  scorecard: ScorecardItem[];
};

export type CommitStatus = {
  name: string;
  description: string;
  status: PushStatusBase;
  url: string | null;
};

export type PushResponse = {
  id: string;
  remoteId: string;
  isMainBranch: boolean;
  isOutdated: boolean;
  hasChanges: boolean;
  replace: boolean;
  scoutJobId: string | null;
  uploadedFiles: {
    path: string;
    mimeType: string;
  }[];
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
    statuses: CommitStatus[];
  };
  remote: {
    commits: {
      sha: string;
      branchName: string;
    }[];
  };
  status: {
    preview: DeploymentStatusResponse;
    production: DeploymentStatusResponse;
  };
};

export interface PushStatusSummary {
  preview: DeploymentStatusResponse;
  production: DeploymentStatusResponse | null;
  commit: PushResponse['commit'];
}
