import * as core from '@actions/core';
import * as main from '../src/main';

const runMock = jest.spyOn(main, 'run');

// Mock the GitHub Actions core library
let errorMock: jest.SpiedFunction<typeof core.error>;
let getInputMock: jest.SpiedFunction<typeof core.getInput>;
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>;

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    errorMock = jest.spyOn(core, 'error').mockImplementation();
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation();
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation();
  });

  it('sets a failed status', async () => {
    getInputMock.mockImplementation(getGetInputMock({}));

    await main.run();
    expect(runMock).toHaveReturned();

    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'Unsupported GitHub event type. Only "push" and "pull_request" events are supported.'
    );
    expect(errorMock).not.toHaveBeenCalled();
  });
});

function getGetInputMock(mockInput: object) {
  return (name: string) => {
    // @ts-expect-error Description explaining why the @ts-expect-error is necessary.
    return mockInput[name] || '';
  };
}
