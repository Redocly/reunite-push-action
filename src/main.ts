import * as core from '@actions/core'
import * as github from '@actions/github'

import { handlePush } from '@redocly/cli/lib/cms/commands/push'
import { handlePushStatus } from '@redocly/cli/lib/cms/commands/push-status'

import { setCommitStatuses } from './set-commit-statuses'
import { getRedoclyConfig, parseEventData, parseInputData } from './helpers'

export async function run(): Promise<void> {
  try {
    const inputData = parseInputData()
    const ghEvent = await parseEventData()

    // eslint-disable-next-line no-console
    console.debug('Push arguments', {
      inputData,
      ghEvent
    })

    const config = await getRedoclyConfig(inputData.redoclyConfigPath)

    const pushData = await handlePush(
      {
        domain: inputData.redoclyDomain,
        organization: inputData.redoclyOrgSlug,
        project: inputData.redoclyProjectSlug,
        'mount-path': inputData.mountPath,
        files: inputData.files,
        'max-execution-time': inputData.maxExecutionTime,
        namespace: ghEvent.namespace,
        repository: ghEvent.repository,
        branch: ghEvent.branch,
        'default-branch': ghEvent.defaultBranch,
        message: ghEvent.commit.commitMessage,
        'commit-sha': ghEvent.commit.commitSha,
        'commit-url': ghEvent.commit.commitUrl,
        author: ghEvent.commit.commitAuthor,
        'created-at': ghEvent.commit.commitCreatedAt
      },
      config
    )

    if (!pushData?.pushId) {
      throw new Error('Missing push ID')
    }

    const pushStatusData = await handlePushStatus(
      {
        organization: inputData.redoclyOrgSlug,
        project: inputData.redoclyProjectSlug,
        pushId: pushData.pushId,
        domain: inputData.redoclyDomain,
        wait: true,
        'continue-on-deploy-failures': true,
        'max-execution-time': inputData.maxExecutionTime,
        onRetry: async lastResult => {
          try {
            setCommitStatuses({
              data: lastResult,
              owner: ghEvent.namespace,
              repo: ghEvent.repository,
              commitId: ghEvent.commit.commitSha
            })
          } catch (error: unknown) {
            core.error(
              `Failed to set commit statuses. Error: ${(error as Error)?.message}`
            )
          }
        }
      },
      config
    )

    if (!pushStatusData) {
      throw new Error('Missing push status data')
    }

    console.debug(
      'Amount of final commit statuses to set',
      pushStatusData.commit.statuses.length
    )

    await setCommitStatuses({
      data: pushStatusData,
      owner: ghEvent.namespace,
      repo: ghEvent.repository,
      commitId: ghEvent.commit.commitSha
    })

    console.debug('Action finished successfully. Push ID:', pushData.pushId)

    core.setOutput('pushId', pushData.pushId)
  } catch (error) {
    console.debug('GitHub context', JSON.stringify(github.context, null, 2))
    if (error instanceof Error) core.setFailed(error.message)
  }
}
