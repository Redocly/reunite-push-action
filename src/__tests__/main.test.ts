import * as core from '@actions/core';
import * as handlePushCommand from '@redocly/cli/lib/cms/commands/push';
import * as handlePushStatusCommand from '@redocly/cli/lib/cms/commands/push-status';

import * as main from '../main';
import * as helpers from '../helpers';

import * as commitStatusUtils from '../set-commit-statuses';
import {
  parsedEventPushDataMock,
  parsedInputDataStub,
  pushStatusSummaryStub,
} from './fixtures';

const runMock = jest.spyOn(main, 'run');

let parseInputDataMock: jest.SpiedFunction<typeof helpers.parseInputData>;
let parseEventDataMock: jest.SpiedFunction<typeof helpers.parseEventData>;
let handlePushMock: jest.SpiedFunction<typeof handlePushCommand.handlePush>;
let handlePushStatusMock: jest.SpiedFunction<
  typeof handlePushStatusCommand.handlePushStatus
>;
let setOutputMock: jest.SpiedFunction<typeof core.setOutput>;
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>;

let setCommitStatusMock: jest.SpiedFunction<
  typeof commitStatusUtils.setCommitStatuses
>;

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    parseInputDataMock = jest
      .spyOn(helpers, 'parseInputData')
      .mockImplementation(() => parsedInputDataStub);

    parseEventDataMock = jest
      .spyOn(helpers, 'parseEventData')
      .mockImplementation(async () => parsedEventPushDataMock);

    handlePushMock = jest
      .spyOn(handlePushCommand, 'handlePush')
      .mockImplementation(async () => ({
        pushId: 'test-push-id',
      }));

    handlePushStatusMock = jest
      .spyOn(handlePushStatusCommand, 'handlePushStatus')
      .mockImplementation(async () => pushStatusSummaryStub);

    setCommitStatusMock = jest
      .spyOn(commitStatusUtils, 'setCommitStatuses')
      .mockImplementation(async () => {});

    setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation();
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation();
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
