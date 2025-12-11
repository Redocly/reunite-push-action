import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import * as core from '@actions/core';
import * as handlePushCommand from '@redocly/cli/lib/reunite/commands/push';
import * as handlePushStatusCommand from '@redocly/cli/lib/reunite/commands/push-status';

import * as main from '../main';
import * as helpers from '../helpers';
import * as commitStatusUtils from '../set-commit-statuses';
import {
  parsedEventPushDataMock,
  parsedInputDataStub,
  pushStatusSummaryStub,
} from './fixtures';

vi.mock('@actions/core', { spy: true });
vi.mock('@redocly/cli/lib/reunite/commands/push', { spy: true });
vi.mock('@redocly/cli/lib/reunite/commands/push-status', { spy: true });
vi.mock('../helpers', { spy: true });
vi.mock('../set-commit-statuses', { spy: true });
vi.mock('../main', { spy: true });

let runMock: Mock<typeof main.run>;
let parseInputDataMock: Mock<typeof helpers.parseInputData>;
let parseEventDataMock: Mock<typeof helpers.parseEventData>;
let handlePushMock: Mock<typeof handlePushCommand.handlePush>;
let handlePushStatusMock: Mock<typeof handlePushStatusCommand.handlePushStatus>;
let setOutputMock: Mock<typeof core.setOutput>;
let setFailedMock: Mock<typeof core.setFailed>;
let setCommitStatusMock: Mock<typeof commitStatusUtils.setCommitStatuses>;

describe('action', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    runMock = vi.mocked(main.run);

    parseInputDataMock = vi
      .mocked(helpers.parseInputData)
      .mockImplementation(() => parsedInputDataStub);

    parseEventDataMock = vi
      .mocked(helpers.parseEventData)
      .mockImplementation(async () => parsedEventPushDataMock);

    handlePushMock = vi
      .mocked(handlePushCommand.handlePush)
      .mockImplementation(async () => ({
        pushId: 'test-push-id',
      }));

    handlePushStatusMock = vi
      .mocked(handlePushStatusCommand.handlePushStatus)
      .mockImplementation(async () => pushStatusSummaryStub);

    setCommitStatusMock = vi
      .mocked(commitStatusUtils.setCommitStatuses)
      .mockImplementation(async () => {});

    setOutputMock = vi.mocked(core.setOutput).mockImplementation(vi.fn());
    setFailedMock = vi.mocked(core.setFailed).mockImplementation(vi.fn());
  });

  it('should set commit status and return push id', async () => {
    await main.run();

    expect(runMock).toHaveReturned();
    expect(parseInputDataMock).toHaveBeenCalled();
    expect(parseEventDataMock).toHaveBeenCalled();
    expect(handlePushMock).toHaveBeenCalled();
    expect(handlePushStatusMock).toHaveBeenCalled();
    expect(setCommitStatusMock).toHaveBeenCalled();
    expect(setOutputMock).toHaveBeenCalledWith('pushId', 'test-push-id');
    expect(setFailedMock).not.toHaveBeenCalled();
  });

  it('sets a failed status in case push error', async () => {
    handlePushMock.mockImplementation(async () => {
      throw new Error('Test error message from handlePush');
    });

    await main.run();
    expect(runMock).toHaveReturned();

    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'Test error message from handlePush',
    );
    expect(setOutputMock).not.toHaveBeenCalled();
  });
});
