import type { SimulationAction, SurferState } from '../../types';

/**
 * Validates state transitions for a simulated web surfer.
 */
export function isValidTransition(
  currentState: SurferState['status'],
  action: SimulationAction
): boolean {
  switch (currentState) {
    case 'idle':
      return action === 'SEARCH';
    case 'searching':
      return action === 'SCAN' || action === 'END_SESSION';
    case 'viewing_results':
      return action === 'CLICK_RESULT' || action === 'SCAN' || action === 'END_SESSION';
    case 'browsing_page':
      return (
        action === 'DWELL' ||
        action === 'SCROLL' ||
        action === 'FOLLOW_LINK' ||
        action === 'RETURN_TO_SEARCH' ||
        action === 'END_SESSION'
      );
    case 'session_ended':
      return false;
    default:
      return false;
  }
}

