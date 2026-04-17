import { retrievePlayerData } from "../player-api.js"

const player = retrievePlayerData();

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
};

function getRooms() {
	try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
	catch { return []; }
}

function saveRooms(rooms) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
}

function escapeHtml(str) {
	return String(str).replace(/[&<>"']/g, c =>
		({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
	);
}

// ── View switching ──
let currentGame = null;

function showView(id) {
	['view-games', 'view-mode', 'view-rooms'].forEach(v =>
		document.getElementById(v).classList.toggle('hidden', v !== id)
	);
}

function showGames() {
	showView('view-games');
}

function showMode(game) {
	currentGame = game;
	document.getElementById('mode-view-title').textContent = GAME_LABELS[game] || game;
	showView('view-mode');
}

function showRooms(game) {
	currentGame = game;
	document.getElementById('room-view-title').textContent = GAME_LABELS[game] || game;
	document.getElementById('player-name').textContent = player.getName();
	showView('view-rooms');
	renderRooms();
}

// ── Room rendering ──
function renderRooms() {
	const all     = getRooms().filter(r => r.game === currentGame);
	const list    = document.getElementById('lobby-list');
	const empty   = document.getElementById('empty-msg');
	const counter = document.getElementById('open-count');

	counter.textContent = `${all.length} open`;
	empty.style.display = all.length === 0 ? 'block' : 'none';
	list.innerHTML = '';

	for (const room of all) {
		const url  = `${GAME_PAGES[room.game]}?room=${encodeURIComponent(room.id)}`;
		const card = document.createElement('div');
		card.className = 'room-card';
		card.innerHTML = `
			<div>
				<div class="room-card-name">${escapeHtml(room.name)}</div>
				<div class="room-card-meta">by ${escapeHtml(room.creator)}</div>
			</div>
			<a class="btn-join" href="${escapeHtml(url)}">Join</a>
		`;
		list.appendChild(card);
	}
}

// ── Create room ──
document.getElementById('create-btn').addEventListener('click', () => {
	const nameInput = document.getElementById('room-name');
	const name = nameInput.value.trim() || `${player.getName()}'s Table`;

	const rooms = getRooms();
	rooms.unshift({
		id:      crypto.randomUUID(),
		name,
		game:    currentGame,
		creator: player.getName()
	});
	saveRooms(rooms);
	renderRooms();
	nameInput.value = '';
});

// ── Game card clicks → go to mode select ──
document.querySelectorAll('.game-card:not(.coming-soon)').forEach(card => {
	card.addEventListener('click', () => showMode(card.dataset.game));
});

// ── Mode select buttons ──
document.getElementById('btn-solo').addEventListener('click', () => {
	location.href = `${GAME_PAGES[currentGame]}?solo=true`;
});

document.getElementById('btn-multi').addEventListener('click', () => {
	showRooms(currentGame);
});

document.getElementById('btn-back-mode').addEventListener('click', showGames);
document.getElementById('btn-back-games').addEventListener('click', showGames);

// ── Custom cursor ──
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', e => {
	cursor.style.left = e.clientX + 'px';
	cursor.style.top  = e.clientY + 'px';
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

