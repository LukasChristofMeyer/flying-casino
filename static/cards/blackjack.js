import { Deck } from "./deck.js";
import { retrievePlayerData, LocalPlayerData } from "../player-api.js";

// ── Custom cursor ──
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', e => {
	cursor.style.left = e.clientX + 'px';
	cursor.style.top  = e.clientY + 'px';
});
document.querySelectorAll('.lobby-btn, .action-btn, .back-link').forEach(el => {
	el.addEventListener('mouseenter', () => {
		cursor.style.width = '16px'; cursor.style.height = '16px';
		cursor.style.background = '#c9a84c';
	});
	el.addEventListener('mouseleave', () => {
		cursor.style.width = '8px'; cursor.style.height = '8px';
		cursor.style.background = 'var(--white-ball)';
	});
});
document.addEventListener('mouseover', e => {
	if (e.target.closest('.card')) {
		cursor.style.width = '16px'; cursor.style.height = '16px';
		cursor.style.background = '#c9a84c';
	}
});
document.addEventListener('mouseout', e => {
	if (e.target.closest('.card')) {
		cursor.style.width = '8px'; cursor.style.height = '8px';
		cursor.style.background = 'var(--white-ball)';
	}
});

// ── Card rendering helpers ──
const SUIT_SYM  = { Spade:'♠', Heart:'♥', Club:'♣', Diamond:'♦' }
const RED_SUITS = new Set(['Heart', 'Diamond'])
const SHORT_LBL = {
	Ace:'A', Two:'2', Three:'3', Four:'4', Five:'5',
	Six:'6', Seven:'7', Eight:'8', Nine:'9', Ten:'10',
	Jack:'J', Queen:'Q', King:'K'
}

function makeCardEl(card, faceDown = false) {
	const el = document.createElement('div')
	el.classList.add('card', 'reveal-anim')
	if (faceDown) { el.classList.add('card-back'); return el }
	const suit = SUIT_SYM[card.suit], lbl = SHORT_LBL[card.label]
	el.classList.add(RED_SUITS.has(card.suit) ? 'red' : 'black')
	el.innerHTML =
		`<div class="card-corner">${lbl}<span>${suit}</span></div>` +
		`<div class="card-center-suit">${suit}</div>` +
		`<div class="card-corner bot">${lbl}<span>${suit}</span></div>`
	return el
}

// ── BlackjackHTMLHandler ──
export class BlackjackHTMLHandler {
	deck       = new Deck(2)
	playerHand = []
	dealerHand = []

	dealerCardsEl = document.getElementById('dealer-cards')
	dealerValueEl = document.getElementById('dealer-value')
	playerCardsEl = document.getElementById('player-cards')
	playerValueEl = document.getElementById('player-value')

	getValue(hand) {
		let total = hand.reduce((s, c) => s + c.value, 0)
		let aces  = hand.filter(c => c.label === 'Ace').length
		while (total > 21 && aces-- > 0) total -= 10
		return total
	}

	hit(hand) {
		hand.push(this.deck.cards.pop())
	}

	stay() {}

	dealerPlay() {
		while (this.getValue(this.dealerHand) < 17) {
			this.hit(this.dealerHand)
		}
	}

	renderCards(container, hand, hideSecond = false) {
		container.innerHTML = ''
		hand.forEach((card, i) => container.appendChild(makeCardEl(card, hideSecond && i === 1)))
	}

	updateValue(el, hand, hidden = false) {
		if (hidden) { el.textContent = '?'; el.className = 'seat-value'; return }
		const v = this.getValue(hand)
		el.textContent = v
		el.className = 'seat-value' + (v > 21 ? ' bust' : v === 21 ? ' good' : '')
	}
}

export class Player {
	constructor(sendFunction) {
		this.send = sendFunction
	}
}

// ── Singleplayer controller ──
const handler = new BlackjackHTMLHandler()

const playerName    = retrievePlayerData().getName()
const viewLobby     = document.getElementById('view-lobby')
const viewGame      = document.getElementById('view-game')
const btnPlay       = document.getElementById('btn-play')
const playerNameEl  = document.getElementById('player-name-display')
const btnHit        = document.getElementById('btn-hit')
const btnStay       = document.getElementById('btn-stay')
const btnDeal       = document.getElementById('btn-deal')
const resultDisplay = document.getElementById('result-display')
const roundLabel    = document.getElementById('round-label')
const gameLog       = document.getElementById('game-log')

let roundCount = 0

function addLog(text, cls = '') {
	const p = document.createElement('p')
	if (cls) p.classList.add(cls)
	p.textContent = text
	gameLog.prepend(p)
}

function showResult(text, cls) {
	resultDisplay.textContent = text
	resultDisplay.className   = 'result-display ' + cls
	resultDisplay.classList.remove('hidden')
}

function setActionState(active, dealing) {
	btnHit.disabled  = !active; btnStay.disabled = !active
	btnDeal.classList.toggle('hidden', !dealing)
	btnHit.classList.toggle('hidden',   dealing)
	btnStay.classList.toggle('hidden',  dealing)
}

function startRound() {
	handler.deck.reset(); handler.deck.shuffle()
	handler.playerHand = [handler.deck.cards.pop(), handler.deck.cards.pop()]
	handler.dealerHand = [handler.deck.cards.pop(), handler.deck.cards.pop()]
	roundCount++
	roundLabel.textContent = `Round ${roundCount}`
	resultDisplay.classList.add('hidden')
	handler.renderCards(handler.dealerCardsEl, handler.dealerHand, true)
	handler.renderCards(handler.playerCardsEl, handler.playerHand)
	handler.updateValue(handler.dealerValueEl, handler.dealerHand, true)
	handler.updateValue(handler.playerValueEl, handler.playerHand)
	setActionState(true, false)
	addLog(`— Round ${roundCount} —`, 'log-round')
	if (handler.getValue(handler.playerHand) === 21) { addLog('Blackjack!', 'log-win'); endRound() }
}

function endRound() {
	handler.renderCards(handler.dealerCardsEl, handler.dealerHand)
	handler.dealerPlay()
	handler.renderCards(handler.dealerCardsEl, handler.dealerHand)
	handler.updateValue(handler.dealerValueEl, handler.dealerHand)
	handler.updateValue(handler.playerValueEl, handler.playerHand)
	setActionState(false, true)
	const pv = handler.getValue(handler.playerHand)
	const dv = handler.getValue(handler.dealerHand)
	if      (pv > 21)             { showResult('Bust — Dealer Wins', 'lose'); addLog('You bust.', 'log-action') }
	else if (dv > 21 || pv > dv) { showResult('You Win!', 'win');    LocalPlayerData.giveWins();        addLog(`You win — ${pv} vs ${dv}`, 'log-win') }
	else if (pv === dv)           { showResult('Push', 'push');               addLog(`Push — ${pv} each`) }
	else                          { showResult('Dealer Wins', 'lose');        addLog(`Dealer wins — ${dv} vs ${pv}`, 'log-action') }
}

btnPlay.addEventListener('click', () => {
	playerNameEl.textContent = playerName || 'Player'
	viewLobby.classList.add('hidden')
	viewGame.classList.remove('hidden')
	startRound()
})
btnHit.addEventListener('click', () => {
	handler.hit(handler.playerHand)
	handler.renderCards(handler.playerCardsEl, handler.playerHand)
	handler.updateValue(handler.playerValueEl, handler.playerHand)
	addLog('Hit.', 'log-action')
	if (handler.getValue(handler.playerHand) >= 21) endRound()
})
btnStay.addEventListener('click', () => { addLog('Stay.', 'log-action'); endRound() })
btnDeal.addEventListener('click', startRound)
