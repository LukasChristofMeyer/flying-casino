import { Deck } from "./deck.js"
import { retrievePlayerData } from "../player-api.js"
import { constructNetworkAPI } from "../network/network.js"
import { signalServerAddress, apiAddress } from "../flying-casino.js"

const MAX_PLAYERS = 4
const params = new URLSearchParams(window.location.search)
const isSolo = params.has('solo')
const roomId = params.get('room') || 'global'

// ── Custom cursor ──
const cursor = document.getElementById('cursor')
const _savedPos = sessionStorage.getItem('cursorPos')
if (_savedPos) {
	const { x, y } = JSON.parse(_savedPos)
	cursor.style.left = x + 'px'
	cursor.style.top  = y + 'px'
}
document.addEventListener('mousemove', e => {
	cursor.style.left = e.clientX + 'px'
	cursor.style.top  = e.clientY + 'px'
	sessionStorage.setItem('cursorPos', JSON.stringify({ x: e.clientX, y: e.clientY }))
})
document.querySelectorAll('.lobby-btn, .action-btn, .back-link').forEach(el => {
	el.addEventListener('mouseenter', () => {
		cursor.style.width = '16px'; cursor.style.height = '16px'
		cursor.style.background = '#c9a84c'
	})
	el.addEventListener('mouseleave', () => {
		cursor.style.width = '8px'; cursor.style.height = '8px'
		cursor.style.background = 'var(--white-ball)'
	})
})
document.addEventListener('mouseover', e => {
	if (e.target.closest('.card')) {
		cursor.style.width = '16px'; cursor.style.height = '16px'
		cursor.style.background = '#c9a84c'
	}
})
document.addEventListener('mouseout', e => {
	if (e.target.closest('.card')) {
		cursor.style.width = '8px'; cursor.style.height = '8px'
		cursor.style.background = 'var(--white-ball)'
	}
})

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

	hit(hand) { hand.push(this.deck.cards.pop()) }

	stay() {}

	dealerPlay() {
		while (this.getValue(this.dealerHand) < 17) this.hit(this.dealerHand)
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
	constructor(sendFunction) { this.send = sendFunction }
}

// ── Player data ──
const playerData = retrievePlayerData()
let myName = playerData?.getName?.() || ''
if (!myName || myName === 'unnamed') myName = 'Player'

// ── Shared state ──
let network, isHost = false, hostId = null
let myPlayerIndex = -1, playerCount = 0
let players    = []   // view model: [{ name, state, hand: [{label,suit}] }]
let gamePlayers = []  // host-side: [{ name, state, hand, send }]
let roundCount = 0

const handler = new BlackjackHTMLHandler()

// ── DOM ──
const viewLobby    = document.getElementById('view-lobby')
const viewGame     = document.getElementById('view-game')
const lobbyStatus  = document.getElementById('lobby-status')
const lobbyList    = document.getElementById('lobby-player-list')
const lobbyCount   = document.getElementById('lobby-count')
const btnStart     = document.getElementById('btn-start')
const playerNameEl = document.getElementById('player-name-display')
const btnHit       = document.getElementById('btn-hit')
const btnStay      = document.getElementById('btn-stay')
const btnDeal      = document.getElementById('btn-deal')
const btnNextRound = document.getElementById('btn-next-round')
const resultDisplay = document.getElementById('result-display')
const roundLabel   = document.getElementById('round-label')
const gameLog      = document.getElementById('game-log')
const oppRow       = document.getElementById('opponents-row')

// ── Helpers ──
function addLog(text, cls = '') {
	const p = document.createElement('p')
	if (cls) p.className = cls
	p.textContent = text
	gameLog.prepend(p)
}

function showResult(text, cls) {
	resultDisplay.textContent = text
	resultDisplay.className = 'result-display ' + cls
	resultDisplay.classList.remove('hidden')
}

function setActions(canAct) {
	btnHit.disabled = btnStay.disabled = !canAct
}

function escHtml(s) {
	return String(s).replace(/[&<>"']/g, c =>
		({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'": '&#39;' }[c]))
}

// ── Opponent seats ──
function buildOpponentSeats() {
	oppRow.innerHTML = ''
	for (let i = 0; i < playerCount; i++) {
		if (i === myPlayerIndex) continue
		const p = players[i] || {}
		const seat = document.createElement('div')
		seat.className = 'opponent-seat'
		seat.id = `opp-seat-${i}`
		seat.innerHTML =
			`<div class="opp-name">${escHtml(p.name || `Player ${i}`)}</div>` +
			`<div class="opp-cards" id="opp-cards-${i}"></div>` +
			`<div class="opp-state" id="opp-state-${i}"></div>`
		oppRow.appendChild(seat)
	}
}

function updateOpponentSeat(i) {
	const p = players[i]; if (!p) return
	const cardsEl = document.getElementById(`opp-cards-${i}`)
	const stateEl = document.getElementById(`opp-state-${i}`)
	if (cardsEl && p.hand) {
		cardsEl.innerHTML = ''
		p.hand.forEach(c => cardsEl.appendChild(makeCardEl(c)))
	}
	if (stateEl) {
		stateEl.textContent = p.state !== 'playing' ? p.state : ''
		stateEl.className = `opp-state${p.state !== 'playing' ? ` state-${p.state}` : ''}`
	}
}

// ── Lobby helpers ──
function addLobbyEntry(name, isSelf = false) {
	const li = document.createElement('li')
	li.className = `lobby-player${isSelf ? ' self' : ''}`
	li.innerHTML = `<span>${escHtml(name)}${isSelf ? ' <em style="opacity:.4">(you)</em>' : ''}</span>`
	lobbyList.appendChild(li)
}

function refreshCount() {
	const n = lobbyList.children.length
	lobbyCount.textContent = `${n} / ${MAX_PLAYERS} players`
	if (btnStart) btnStart.textContent = `Start Game (${n})`
}

// ── Game view init ──
function initGameView() {
	viewLobby.classList.add('hidden')
	viewGame.classList.remove('hidden')
	playerNameEl.textContent = myName
	if (playerCount > 1) buildOpponentSeats()
}

// ── Host: deal new round ──
function hostStartRound() {
	btnDeal.classList.add('hidden')
	btnNextRound.classList.add('hidden')
	btnHit.classList.remove('hidden')
	btnStay.classList.remove('hidden')
	resultDisplay.classList.add('hidden')
	roundCount++

	handler.deck.reset()
	handler.deck.shuffle()
	handler.dealerHand = [handler.deck.cards.pop(), handler.deck.cards.pop()]

	for (const p of gamePlayers) {
		p.hand = [handler.deck.cards.pop(), handler.deck.cards.pop()]
		p.state = 'playing'
	}

	addLog(`— Round ${roundCount} —`, 'log-round')
	hostSyncAndBroadcast(false)

	// Auto-stay anyone dealt 21
	let anyBlackjack = false
	for (const p of gamePlayers) {
		if (p.state === 'playing' && handler.getValue(p.hand) === 21) {
			p.state = 'stayed'
			anyBlackjack = true
			addLog(`${p.name} — Blackjack!`, 'log-win')
		}
	}
	if (anyBlackjack) {
		hostSyncAndBroadcast(false)
		checkAllDone()
	}
}

// ── Host: sync and broadcast state ──
function syncPlayers() {
	players = gamePlayers.map(p => ({
		name: p.name,
		state: p.state,
		hand: p.hand ? p.hand.map(c => ({ label: c.label, suit: c.suit, value: c.value })) : []
	}))
}

function hostSyncAndBroadcast(revealDealer) {
	syncPlayers()
	const msg = {
		type: 'blackjackState',
		players,
		dealerHand: revealDealer
			? handler.dealerHand.map(c => ({ label: c.label, suit: c.suit, value: c.value }))
			: [{ label: handler.dealerHand[0].label, suit: handler.dealerHand[0].suit, value: handler.dealerHand[0].value }],
		dealerRevealed: revealDealer,
		roundCount
	}
	if (network) network.broadcastObject(msg)
	applyGameState(msg)
}

// ── Host: handle a player's hit/stay ──
function hostHandleAction(playerIndex, action) {
	const p = gamePlayers[playerIndex]
	if (!p || p.state !== 'playing') return

	if (action === 'hit') {
		p.hand.push(handler.deck.cards.pop())
		const val = handler.getValue(p.hand)
		if (val >= 21) p.state = 'bust'
		addLog(`${p.name} hit.${val > 21 ? ' Bust!' : ''}`, 'log-action')
	} else {
		p.state = 'stayed'
		addLog(`${p.name} stayed.`, 'log-action')
	}

	hostSyncAndBroadcast(false)
	checkAllDone()
}

function checkAllDone() {
	if (!gamePlayers.every(p => p.state !== 'playing')) return
	handler.dealerPlay()
	hostSyncAndBroadcast(true)
	hostBroadcastResults()
}

function hostBroadcastResults() {
	const dv = handler.getValue(handler.dealerHand)
	const results = gamePlayers.map((p, i) => {
		const pv = handler.getValue(p.hand)
		let outcome
		if      (pv > 21)             outcome = 'bust'
		else if (dv > 21 || pv > dv)  outcome = 'win'
		else if (pv === dv)            outcome = 'push'
		else                           outcome = 'lose'
		return { playerIndex: i, outcome }
	})
	const msg = { type: 'blackjackResult', results, dealerValue: dv }
	if (network) network.broadcastObject(msg)
	applyResults(msg)
}

// ── Client: render incoming game state ──
function applyGameState(msg) {
	players = msg.players
	roundLabel.textContent = `Round ${msg.roundCount || roundCount}`
	resultDisplay.classList.add('hidden')

	// Dealer: show sent card(s) + a face-down placeholder before reveal
	handler.dealerCardsEl.innerHTML = ''
	msg.dealerHand.forEach(c => handler.dealerCardsEl.appendChild(makeCardEl(c)))
	if (!msg.dealerRevealed) handler.dealerCardsEl.appendChild(makeCardEl(null, true))
	handler.updateValue(handler.dealerValueEl, msg.dealerHand, !msg.dealerRevealed)

	// My hand
	const me = players[myPlayerIndex]
	if (me?.hand) {
		handler.renderCards(handler.playerCardsEl, me.hand)
		handler.updateValue(handler.playerValueEl, me.hand)
		setActions(me.state === 'playing')
	}

	// Opponent seats
	for (let i = 0; i < players.length; i++) {
		if (i !== myPlayerIndex) updateOpponentSeat(i)
	}
}

// ── Client: render round results ──
function applyResults(msg) {
	setActions(false)

	const dv = msg.dealerValue
	msg.results.forEach(r => {
		const name = players[r.playerIndex]?.name || `Player ${r.playerIndex}`
		if (r.playerIndex === myPlayerIndex) {
			if      (r.outcome === 'win')  { showResult('You Win!', 'win'); playerData.giveWins() }
			else if (r.outcome === 'push')   showResult('Push', 'push')
			else if (r.outcome === 'bust')   showResult('Bust', 'lose')
			else                             showResult('Dealer Wins', 'lose')
		}
		addLog(`${name}: ${r.outcome} (dealer ${dv})`, r.outcome === 'win' ? 'log-win' : 'log-action')
	})

	if (isHost && isSolo) {
		btnHit.classList.add('hidden')
		btnStay.classList.add('hidden')
		btnDeal.classList.remove('hidden')
	} else if (isHost && !isSolo) {
		btnNextRound.classList.remove('hidden')
	}
}

// ── Send hit/stay to host ──
function playerAction(action) {
	if (isHost) {
		hostHandleAction(myPlayerIndex, action)
	} else {
		try { network.sendObject({ type: 'blackjackAction', action, playerIndex: myPlayerIndex }, hostId) } catch {}
	}
}

btnHit.addEventListener('click',  () => playerAction('hit'))
btnStay.addEventListener('click', () => playerAction('stay'))

// ── Solo mode ──
if (isSolo) {
	isHost = true
	myPlayerIndex = 0
	playerCount = 1
	gamePlayers = [{ name: myName, state: 'playing', hand: [], send: () => {} }]
	players = [{ name: myName, state: 'playing', hand: [] }]
	btnDeal.addEventListener('click', hostStartRound)
	initGameView()
	hostStartRound()
}

// ── Multiplayer mode ──
if (!isSolo) {
	network = await constructNetworkAPI(signalServerAddress, roomId)
	addLobbyEntry(myName, true)
	refreshCount()

	// Auto-determine host: first peer in the room becomes host
	const isFirstInRoom = !Object.values(network.peers).some(p => p.connection !== null)
	let announceInterval = null

	if (isFirstInRoom) {
		isHost = true; myPlayerIndex = 0
		gamePlayers = [{ name: myName, state: 'waiting', hand: [], send: () => {} }]
		players = [{ name: myName, state: 'waiting', hand: [] }]
		lobbyStatus.textContent = 'Waiting for players…'
		announceInterval = setInterval(() => network.broadcastObject({ type: 'blackjackStart' }), 1500)
	} else {
		lobbyStatus.textContent = 'Connecting to host…'
	}

	network.onmessage = (ev) => {
		const msg = JSON.parse(ev.data)
		switch (msg.type) {

			case 'blackjackStart':
				if (hostId || isHost) break
				hostId = msg.from
				lobbyStatus.textContent = 'Joining…'
				network.sendObject({ type: 'blackjackJoin', name: myName }, hostId)
				break

			case 'blackjackJoin':
				if (!isHost || gamePlayers.length >= MAX_PLAYERS) break
				{
					const peerId = msg.from
					const p = {
						name: msg.name || peerId.slice(0, 8),
						state: 'waiting',
						hand: [],
						send: obj => { try { network.sendObject(obj, peerId) } catch {} }
					}
					gamePlayers.push(p)
					players.push({ name: p.name, state: p.state, hand: [] })
					addLobbyEntry(p.name)
					refreshCount()
					if (gamePlayers.length >= 2) btnStart.disabled = false
					lobbyStatus.textContent = gamePlayers.length >= MAX_PLAYERS
						? 'Table full!'
						: `${gamePlayers.length} player(s) ready…`
				}
				break

			case 'blackjackInit':
				myPlayerIndex = msg.playerIndex
				playerCount   = msg.players.length
				players       = msg.players
				hostId        = msg.from
				initGameView()
				break

			case 'blackjackState':
				applyGameState(msg)
				break

			case 'blackjackResult':
				applyResults(msg)
				break

			case 'blackjackAction':
				if (isHost) hostHandleAction(msg.playerIndex, msg.action)
				break
		}
	}

	btnStart.onclick = () => {
		if (!isHost || gamePlayers.length < 2) return
		clearInterval(announceInterval)
		playerCount = gamePlayers.length
		players = gamePlayers.map(p => ({ name: p.name, state: 'waiting', hand: [] }))
		for (let i = 1; i < gamePlayers.length; i++) {
			gamePlayers[i].send({ type: 'blackjackInit', playerIndex: i, players })
		}
		const request = new XMLHttpRequest()
		request.open('POST', apiAddress + '/room-started')
		request.send(new Blob([JSON.stringify({ id: roomId })], { type: 'text/plain' }))
		initGameView()
		hostStartRound()
	}

	btnNextRound.onclick = () => { if (isHost) hostStartRound() }
}
