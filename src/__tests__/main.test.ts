import * as core from '@actions/core';
import { getMostUrgentSunsetWarning } from '@redocly/reunite-integration';

import * as main from '../main';
import * as helpers from '../helpers';
import * as push from '../push';
import * as pushStatus from '../push-status';

import * as commitStatusUtils from '../set-commit-statuses';
import {
  parsedEventPushDataMock,
  parsedInputDataStub,
  pushStatusSummaryStub,
} from './fixtures';

const runMock = jest.spyOn(main, 'run');

let parseInputDataMock: jest.SpiedFunction<typeof helpers.parseInputData>;
let parseEventDataMock: jest.SpiedFunction<typeof helpers.parseEventData>;
let pushToReuniteMock: jest.SpiedFunction<typeof push.pushToReunite>;
let waitForDeploymentMock: jest.SpiedFunction<
  typeof pushStatus.waitForDeployment
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

    pushToReuniteMock = jest
      .spyOn(push, 'pushToReunite')
      .mockResolvedValue('test-push-id');

    waitForDeploymentMock = jest
      .spyOn(pushStatus, 'waitForDeployment')
      .mockResolvedValue(pushStatusSummaryStub);

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
    expect(pushToReuniteMock).toHaveBeenCalledWith({
      inputData: parsedInputDataStub,
      ghEvent: parsedEventPushDataMock,
      onSunsetWarning: expect.any(Function),
    });
    expect(waitForDeploymentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        domain: parsedInputDataStub.redoclyDomain,
        organization: parsedInputDataStub.redoclyOrgSlug,
        project: parsedInputDataStub.redoclyProjectSlug,
        pushId: 'test-push-id',
        maxExecutionTime: parsedInputDataStub.maxExecutionTime,
      }),
    );
    expect(setCommitStatusMock).toHaveBeenCalledWith({
      commitStatuses: pushStatusSummaryStub.commit.statuses,
      owner: parsedEventPushDataMock.namespace,
      repo: parsedEventPushDataMock.repository,
      commitId: parsedEventPushDataMock.commit.commitSha,
    });
    expect(setOutputMock).toHaveBeenCalledWith('pushId', 'test-push-id');
    expect(setFailedMock).not.toHaveBeenCalled();
  });

  it('sets commit statuses on each deployment status retry', async () => {
    waitForDeploymentMock.mockImplementation(async ({ onRetry }) => {
      await onRetry?.(pushStatusSummaryStub);

      return pushStatusSummaryStub;
    });

    await main.run();

    expect(runMock).toHaveReturned();
    expect(setCommitStatusMock).toHaveBeenCalledTimes(2);
    expect(setFailedMock).not.toHaveBeenCalled();
  });

  it('sets a failed status in case push error', async () => {
    pushToReuniteMock.mockImplementation(async () => {
      throw new Error('Test error message from push');
    });

    await main.run();
    expect(runMock).toHaveReturned();

    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'Test error message from push',
    );
    expect(setOutputMock).not.toHaveBeenCalled();
  });

  it('reports a sunset warning once, even when the run fails afterwards', async () => {
    const sunsetWarning = {
      sunsetDate: new Date('2030-01-01T00:00:00Z'),
      isSunsetExpired: false,
    };
    jest
      .mocked(getMostUrgentSunsetWarning)
      .mockImplementation(warnings => warnings[0]);
    const warningMock = jest.spyOn(core, 'warning').mockImplementation();
    pushToReuniteMock.mockImplementation(async ({ onSunsetWarning }) => {
      onSunsetWarning?.(sunsetWarning);
      return 'test-push-id';
    });
    waitForDeploymentMock.mockImplementation(async ({ onSunsetWarning }) => {
      onSunsetWarning?.(sunsetWarning);
      throw new Error('Timeout exceeded.');
    });

    await main.run();

    expect(setFailedMock).toHaveBeenCalledWith('Timeout exceeded.');
    expect(warningMock).toHaveBeenCalledTimes(1);
    expect(warningMock).toHaveBeenCalledWith(
      'This version of the action will stop working with the Reunite API after 2030-01-01T00:00:00.000Z. Update the action to its latest version.',
    );
  });
});
