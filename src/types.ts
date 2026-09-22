import type {
  DeploymentStatusResponse,
  PushResponse,
} from '@redocly/reunite-integration';

export type {
  DeploymentStatus,
  DeploymentStatusResponse,
  PushResponse,
} from '@redocly/reunite-integration';

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
    commitAuthor: { name: string; email: string };
    commitCreatedAt?: string;
  };
}

export type CommitStatus = PushResponse['commit']['statuses'][number];

export interface PushStatusSummary {
  preview: DeploymentStatusResponse;
  production: DeploymentStatusResponse | null;
  commit: PushResponse['commit'];
}
