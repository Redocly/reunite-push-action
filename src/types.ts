export interface ParsedInputData {
  redoclyOrgSlug: string;
  redoclyProjectSlug: string;
  redoclyDomain: string;
  files: string[];
  mountPath: string;
  maxExecutionTime: number;
  redoclyConfigPath?: string;
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
