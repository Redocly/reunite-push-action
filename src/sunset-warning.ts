import * as core from '@actions/core';
import {
  getMostUrgentSunsetWarning,
  type SunsetWarning,
} from '@redocly/reunite-integration';

// Reunite announces API deprecations with a Sunset header on its responses.
export function reportSunsetWarning(warnings: SunsetWarning[]): void {
  const warning = getMostUrgentSunsetWarning(warnings);

  if (!warning) {
    return;
  }

  const updateMessage = 'Update the action to its latest version.';

  if (warning.isSunsetExpired) {
    core.error(
      `This version of the action is no longer compatible with the Reunite API. ${updateMessage}`,
    );
  } else {
    core.warning(
      `This version of the action will stop working with the Reunite API after ${warning.sunsetDate.toISOString()}. ${updateMessage}`,
    );
  }
}
