/** Server IP for API
 * @type {string}
 */
export const apiAddress = "http://flying-casino-brakftgmdhbca5cy.canadacentral-01.azurewebsites.net/";

/** Server IP for signaling server
 * @type {string}
 */
export const signalServerAddress = "wss://flying-casino-brakftgmdhbca5cy.canadacentral-01.azurewebsites.net/";

// To run locally, change apiAddress to "http://localhost:8765", and signalServerAddress to "ws://localhost:8765"

const enableDebugging = true;

/** Prints debug-only messages */
export function debugLog(...args) {
	if (enableDebugging)
	console.log('[flying-circus]', ...args);
}