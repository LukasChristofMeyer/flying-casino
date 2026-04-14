import { initializePlayerData } from "./player-api.js";

/** @type {HTMLInputElement} */
const nameInput = document.getElementById('name-input');
/*nameInput.onchange = e => {
	initializePlayerData(e.target.value);
}*/

// ── Custom cursor ──
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', e => {
	cursor.style.left = e.clientX + 'px';
	cursor.style.top  = e.clientY + 'px';
});

document.querySelectorAll('.btn, #name-input, #network-test').forEach(el => {
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

// ── Felt click ripple ──
document.getElementById('felt').addEventListener('click', function(e) {
	if (e.target.closest('.btn, #name-input, a')) return;
	const rect   = this.getBoundingClientRect();
	const ripple = document.createElement('div');
	ripple.style.cssText = `
		position: absolute;
		left: ${e.clientX - rect.left}px;
		top:  ${e.clientY - rect.top}px;
		width: 4px; height: 4px;
		border: 2px solid rgba(255,255,255,0.45);
		border-radius: 50%;
		transform: translate(-50%, -50%);
		animation: rippleOut 0.65s ease-out forwards;
		pointer-events: none;
		z-index: 50;
	`;
	this.appendChild(ripple);
	setTimeout(() => ripple.remove(), 750);
});

// ── Ball jiggle on hover ──
document.querySelectorAll('.ball, .bcue').forEach(ball => {
	ball.addEventListener('mouseenter', function() {
		const tx = (Math.random() - 0.5) * 10;
		const ty = (Math.random() - 0.5) * 10;
		this.style.transition = 'transform 0.15s';
		this.style.transform  = `translate(${tx}px, ${ty}px) scale(1.18)`;
	});
	ball.addEventListener('mouseleave', function() {
		this.style.transform = '';
	});
});

// ── Button loading overlay ──
function showLoadingOverlay(mode) {
	const overlay = document.createElement('div');
	overlay.style.cssText = `
		position: fixed; inset: 0;
		background: rgba(0,0,0,0);
		z-index: 999;
		display: flex; align-items: center; justify-content: center;
		transition: background 0.5s;
	`;
	document.body.appendChild(overlay);
	requestAnimationFrame(() => overlay.style.background = 'rgba(0,0,0,0.88)');

	const msg = document.createElement('div');
	msg.style.cssText = `
		font-family: 'Playfair Display', serif;
		font-size: 28px;
		color: #f0d080;
		text-shadow: 0 0 30px rgba(200,160,50,0.8);
		letter-spacing: 4px;
		opacity: 0;
		transition: opacity 0.4s 0.3s;
		text-align: center;
	`;
	msg.innerHTML = mode === 'solo'
		? '🎱&nbsp; Loading Solo Game&hellip;'
		: '🎱&nbsp; Finding Players&hellip;';
	overlay.appendChild(msg);
	requestAnimationFrame(() => requestAnimationFrame(() => msg.style.opacity = '1'));
	overlay.addEventListener('click', () => overlay.remove());
}

document.getElementById('btn-singleplayer').addEventListener('click', () => {
	initializePlayerData(nameInput.value);
	showLoadingOverlay('solo');
});
document.getElementById('btn-multiplayer').addEventListener('click',  () => {
	initializePlayerData(nameInput.value);
	showLoadingOverlay('multi');
});
