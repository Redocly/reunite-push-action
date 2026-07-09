import { EventEmitter } from 'node:events';
import * as childProcess from 'node:child_process';

import { extractPushId, runRedoclyPush } from '../redocly-cli';
import { parsedEventPushDataMock, parsedInputDataStub } from './fixtures';

jest.mock('node:child_process', () => ({
  spawn: jest.fn(),
}));

const spawnMock = childProcess.spawn as unknown as jest.Mock;

function createFakeCliProcess({
  stdout = '',
  stderr = '',
  exitCode = 0,
}: {
  stdout?: string;
  stderr?: string;
  exitCode?: number;
}): EventEmitter & { stdout: EventEmitter; stderr: EventEmitter } {
  const child = new EventEmitter() as EventEmitter & {
    stdout: EventEmitter;
    stderr: EventEmitter;
  };
  child.stdout = new EventEmitter();
  child.stderr = new EventEmitter();

  setImmediate(() => {
    if (stdout) child.stdout.emit('data', Buffer.from(stdout));
    if (stderr) child.stderr.emit('data', Buffer.from(stderr));
    child.emit('close', exitCode);
  });

  return child;
}

describe('redocly-cli', () => {
  let stdoutWriteMock: jest.SpiedFunction<typeof process.stdout.write>;
  let stderrWriteMock: jest.SpiedFunction<typeof process.stderr.write>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Keep the fake CLI output out of the test runner output.
    stdoutWriteMock = jest
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);
    stderrWriteMock = jest
      .spyOn(process.stderr, 'write')
      .mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutWriteMock.mockRestore();
    stderrWriteMock.mockRestore();
  });

  describe('extractPushId', () => {
    it('should extract the push id from the CLI output', () => {
      expect(extractPushId('Uploading files...\nPush ID: test-push-id\n')).toBe(
        'test-push-id',
      );
    });

    it('should return undefined when there is no push id', () => {
      expect(extractPushId('No files to upload.')).toBeUndefined();
    });
  });

  describe('runRedoclyPush', () => {
    it('should spawn the CLI push command and resolve with the push id', async () => {
      spawnMock.mockReturnValue(
        createFakeCliProcess({ stderr: 'Push ID: test-push-id\n' }),
      );

      const pushId = await runRedoclyPush({
        inputData: parsedInputDataStub,
        ghEvent: parsedEventPushDataMock,
      });

      expect(pushId).toBe('test-push-id');
      expect(spawnMock).toHaveBeenCalledTimes(1);

      const [nodeBinary, args] = spawnMock.mock.calls[0];
      expect(nodeBinary).toBe(process.execPath);
      expect(args[0]).toMatch(/redocly[/\\]cli[/\\]bin[/\\]cli\.js$/);
      expect(args).toEqual(
        expect.arrayContaining([
          'push',
          ...parsedInputDataStub.files,
          `--organization=${parsedInputDataStub.redoclyOrgSlug}`,
          `--project=${parsedInputDataStub.redoclyProjectSlug}`,
          `--mount-path=${parsedInputDataStub.mountPath}`,
          `--domain=${parsedInputDataStub.redoclyDomain}`,
          `--max-execution-time=${parsedInputDataStub.maxExecutionTime}`,
          `--namespace=${parsedEventPushDataMock.namespace}`,
          `--repository=${parsedEventPushDataMock.repository}`,
          `--branch=${parsedEventPushDataMock.branch}`,
          `--default-branch=${parsedEventPushDataMock.defaultBranch}`,
          `--author=${parsedEventPushDataMock.commit.commitAuthor}`,
          `--message=${parsedEventPushDataMock.commit.commitMessage}`,
          `--commit-sha=${parsedEventPushDataMock.commit.commitSha}`,
          `--commit-url=${parsedEventPushDataMock.commit.commitUrl}`,
          `--created-at=${parsedEventPushDataMock.commit.commitCreatedAt}`,
        ]),
      );
    });

    it('should reject when the CLI exits with a non-zero code', async () => {
      spawnMock.mockReturnValue(
        createFakeCliProcess({ stderr: 'Some error\n', exitCode: 1 }),
      );

      await expect(
        runRedoclyPush({
          inputData: parsedInputDataStub,
          ghEvent: parsedEventPushDataMock,
        }),
      ).rejects.toThrow('Redocly CLI exited with code 1.');
    });

    it('should reject when the CLI output has no push id', async () => {
      spawnMock.mockReturnValue(
        createFakeCliProcess({ stdout: 'No files to upload.\n' }),
      );

      await expect(
        runRedoclyPush({
          inputData: parsedInputDataStub,
          ghEvent: parsedEventPushDataMock,
        }),
      ).rejects.toThrow(
        'Could not find the push ID in the Redocly CLI output.',
      );
    });
  });
});
