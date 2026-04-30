/** An interface for player data between the game(s) and the local storage. */
export class LocalPlayerData {
	/** @type {string} */
	#name
	#chips
	#wins
	constructor(name, chips, wins) {
		this.#name = name;
		this.#chips = chips;
		this.#wins = wins;
	}

	getName() {
		return this.#name;
	}

	getChips() {
		return this.#chips;
	}

	giveChips(x) {
		this.#chips += x;
		window.localStorage.setItem('fcp_chips', this.#chips);
	}

	getWins() {
		return this.#wins;
	}

	giveWins() {
		this.#wins += 1;
		window.localStorage.setItem('fcp_wins', this.#wins);
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
	// Don't update chips/wins, those should be persistent
}

/** Retrieves player data stored in local storage from the main menu.
 * @returns {LocalPlayerData}
 */
export function retrievePlayerData() {
	return new LocalPlayerData(
		window.localStorage.getItem('fcp_name') || 'unnamed',
		window.localStorage.getItem('fcp_chips') || 0,
		window.localStorage.getItem('fcp_wins') || 0
	);
}
