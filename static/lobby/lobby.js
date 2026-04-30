import { retrievePlayerData } from "../player-api.js"
import { apiAddress, signalServerAddress, debugLog } from "../flying-casino.js";

const player = retrievePlayerData();

const decoder = new TextDecoder();

// ── Storage ──
const STORAGE_KEY = 'fcp_rooms';

const GAME_LABELS = {
	'holdem':      "Texas Hold 'Em",
	'blackjack':   "Blackjack",
	'video-poker': "Video Poker"
};

const GAME_PAGES = {
	'video-poker': '../cards/video-poker.html',
	'holdem':      '../cards/holdem.html',
	'blackjack':   '../cards/blackjack.html',
};

/** Reads a list of rooms from the API as an array of room objects
 * @returns {Array<{ name: string, creator: string, id: string, game: string }>}
*/
async function getRooms() {
	const response = await fetch(apiAddress + '/rooms');

	let apiResponse = "";
	for await (const chunk of response.body)
		apiResponse += decoder.decode(chunk);

	debugLog('api response:', JSON.parse(apiResponse));

	return JSON.parse(apiResponse);
}
window.getRooms = getRooms;

function saveRooms(rooms) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
}

function escapeHtml(str) {
	return String(str).replace(/[&<>"']/g, c =>
		({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
	);
}

// ── View switching ──
/** The selected game.
 * @type {string}
 */
let currentGame = null;

function showView(id) {
	['view-games', 'view-mode', 'view-rooms'].forEach(v =>
		document.getElementById(v).classList.toggle('hidden', v !== id)
	);
}

function showGames() {
	showView('view-games');
}

/** Show the gamemode for the current game.
 * @param {string} game game title, defined in HTML
 */
function showMode(game) {
	currentGame = game;
	document.getElementById('mode-view-title').textContent = GAME_LABELS[game] || game;
	showView('view-mode');
}

function showRooms() {
	document.getElementById('room-view-title').textContent = GAME_LABELS[currentGame] || currentGame;
	document.getElementById('player-name').textContent = player.getName();
	showView('view-rooms');
	renderRooms();
}

// ── Room rendering ──
/** Displays a list of available multiplayer tables.
 * @param {Array<{ name: string, creator: string, id: string, game: string }>} rooms (optional) list of rooms
 */
async function getPeerCounts() {
	try {
		const httpBase = signalServerAddress.replace(/^wss?:\/\//, 'https://').replace(/\/$/, '');
		const res = await fetch(`${httpBase}/peer-count`);
		return await res.json();
	} catch {
		return {};
	}
}

async function renderRooms(rooms) {
	const all     = (rooms || await getRooms()).filter(r => r.game === currentGame);
	const list    = document.getElementById('lobby-list');
	const empty   = document.getElementById('empty-msg');
	const counter = document.getElementById('open-count');

	counter.textContent = `${all.length} open`;
	empty.style.display = all.length === 0 ? 'block' : 'none';
	list.innerHTML = '';

	const counts = await getPeerCounts();

	for (const room of all) {
		const url        = `${GAME_PAGES[room.game]}?room=${encodeURIComponent(room.id)}`;
		const playerCount = counts[room.id] ?? 0;
		const card = document.createElement('div');
		card.className = 'room-card';
		card.innerHTML = `
			<div>
				<div class="room-card-name">${escapeHtml(room.name)}</div>
				<div class="room-card-meta">by ${escapeHtml(room.creator)}</div>
			</div>
			<span class="room-card-count">${playerCount} ${playerCount === 1 ? 'player' : 'players'}</span>
			<a class="btn-join" href="${escapeHtml(url)}">Join</a>
		`;
		list.appendChild(card);
	}
}

// ── Create room ──
function createRoom() {
	/** @type {HTMLInputElement} */
	const nameInput = document.getElementById('room-name');
	const name = nameInput.value.trim() || `${player.getName()}'s Table`;

	// Cleared immediately
	nameInput.value = '';

	// Send room creation request to server
	const request = new XMLHttpRequest();
	// Rooms are re-rendered upon response from server
	request.addEventListener('load', () => renderRooms());
	request.open('POST', apiAddress + '/create-room');

	const roomCreateRequest = new Blob([ JSON.stringify({
		game: currentGame,
		name: name,
		creator: player.getName()
	}) ], { type: 'text/plain '});

	request.send(roomCreateRequest);
}

document.getElementById('create-btn').addEventListener('click', () => {
	createRoom();
});

// ── Game card clicks → go to mode select (or directly to game for solo-only games) ──
document.querySelectorAll('.game-card:not(.coming-soon)').forEach(card => {
	card.addEventListener('click', () => {
		const game = card.dataset.game;
		if (game === 'video-poker') { location.href = GAME_PAGES['video-poker']; return; }
		showMode(game);
	});
});

// ── Mode select buttons ──
document.getElementById('btn-solo').addEventListener('click', () => {
	location.href = `${GAME_PAGES[currentGame]}?solo=true`;
});

document.getElementById('btn-multi').addEventListener('click', () => {
	showRooms();
});

document.getElementById('btn-back-mode').addEventListener('click', showGames);
document.getElementById('btn-back-games').addEventListener('click', showGames);

// ── Custom cursor ──
const cursor = document.getElementById('cursor');
const _savedPos = sessionStorage.getItem('cursorPos');
if (_savedPos) {
	const { x, y } = JSON.parse(_savedPos);
	cursor.style.left = x + 'px';
	cursor.style.top  = y + 'px';
}
document.addEventListener('mousemove', e => {
	cursor.style.left = e.clientX + 'px';
	cursor.style.top  = e.clientY + 'px';
	sessionStorage.setItem('cursorPos', JSON.stringify({ x: e.clientX, y: e.clientY }));
});

const hoverTargets = '.game-card, .mode-card, .back-link, .btn-join, .create-row button, #create-btn, .create-row input';
document.querySelectorAll(hoverTargets).forEach(el => {
	el.addEventListener('mouseenter', () => {
		cursor.style.width      = '16px';
		cursor.style.height     = '16px';
		cursor.style.background = '#c9a84c';
	});
	el.addEventListener('mouseleave', () => {
		cursor.style.width      = '8px';
		cursor.style.height     = '8px';
		cursor.style.background = 'var(--white-ball)';
	});
});

// ── Felt ripple ──
document.getElementById('felt').addEventListener('click', function(e) {
	if (e.target.closest('.game-card, .back-link, .btn-join, button, input, a')) return;
	const rect   = this.getBoundingClientRect();
	const ripple = document.createElement('div');
	ripple.style.cssText = `
		position:absolute;
		left:${e.clientX - rect.left}px;top:${e.clientY - rect.top}px;
		width:4px;height:4px;
		border:2px solid rgba(255,255,255,0.45);border-radius:50%;
		transform:translate(-50%,-50%);
		animation:rippleOut 0.65s ease-out forwards;
		pointer-events:none;z-index:50;
	`;
	this.appendChild(ripple);
	setTimeout(() => ripple.remove(), 750);
});

// ── Ball jiggle ──
document.querySelectorAll('.ball').forEach(ball => {
	ball.addEventListener('mouseenter', function() {
		this.style.transition = 'transform 0.15s';
		this.style.transform  = `translate(${(Math.random()-.5)*10}px,${(Math.random()-.5)*10}px) scale(1.18)`;
	});
	ball.addEventListener('mouseleave', function() {
		this.style.transform = '';
	});
});

