/** An interface for player data between the game(s) and the local storage. */
class LocalPlayerData {
	#name
	constructor(name) {
		this.#name = name;
	}
	getName() {
		return this.#name;
	}
}

/** Creates local player data in the browser's local storage, to be
 * later accessed by other pages running games.
 * 
 * All local storage values related to player data should use the naming
 * convention "fcp_value", or flying-casino-player_value
 * @param {string} name
 */
export function initializePlayerData(name = 'unnamed') {
	window.localStorage.setItem('fcp_name', name);
}

/** Retrieves player data stored in local storage from the main menu.
 * @returns {LocalPlayerData}
 */
export function retrievePlayerData() {
	return new LocalPlayerData(window.localStorage.getItem('fcp_name') || 'unnamed');
}