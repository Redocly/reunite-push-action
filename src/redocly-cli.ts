/* istanbul ignore file */
/* eslint-disable import/extensions */

import type { CommitStatus } from './set-commit-statuses';

type PushResult = {
  pushId?: string;
};

export type PushStatusResult = {
  commit: {
    statuses: CommitStatus[];
  };
};

type ReuniteCommandArgs = {
  argv: Record<string, unknown>;
  config: unknown;
  version: string;
};

type RedoclyCliCommands = {
  handlePush: (args: ReuniteCommandArgs) => Promise<PushResult | void>;
  handlePushStatus: (
    args: ReuniteCommandArgs,
  ) => Promise<PushStatusResult | void>;
};

export async function loadRedoclyCliCommands(): Promise<RedoclyCliCommands> {
  const [{ handlePush }, { handlePushStatus }] = await Promise.all([
    import('@redocly/cli/lib/reunite/commands/push.js'),
    import('@redocly/cli/lib/reunite/commands/push-status.js'),
  ]);

  return {
    handlePush: async args => handlePush(args as never),
    handlePushStatus: async args => handlePushStatus(args as never),
  };
}
