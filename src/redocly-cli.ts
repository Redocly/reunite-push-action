// Defer loading @redocly/cli until call time. The cli is pure ESM; statically
// importing it from CJS jest would crash with ERR_REQUIRE_ESM.
import type { handlePush } from '@redocly/cli/lib/reunite/commands/push';
import type { handlePushStatus } from '@redocly/cli/lib/reunite/commands/push-status';

type RedoclyCliCommands = {
  handlePush: typeof handlePush;
  handlePushStatus: typeof handlePushStatus;
};

export async function loadRedoclyCliCommands(): Promise<RedoclyCliCommands> {
  const [push, pushStatus] = await Promise.all([
    import('@redocly/cli/lib/reunite/commands/push'),
    import('@redocly/cli/lib/reunite/commands/push-status'),
  ]);

  return {
    handlePush: push.handlePush,
    handlePushStatus: pushStatus.handlePushStatus,
  };
}
