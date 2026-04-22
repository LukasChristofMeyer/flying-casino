/** Server IP for API
 * @type {string}
 */
export const apiAddress = "http://localhost:443";

/** Server IP for signaling server
 * @type {string}
 */
export const signalServerAddress = "wss://flying-casino-brakftgmdhbca5cy.canadacentral-01.azurewebsites.net/";

const enableDebugging = true;

/** Prints debug-only messages */
export function debugLog(...args) {
	if (enableDebugging)
	console.log('[flying-circus]', ...args);
}