import { TexasHoldEm, Player, pokerHandType, pokerHandValueTable } from "./poker.js"
import { constructNetworkAPI } from "../network/network.js"
import { retrievePlayerData, LocalPlayerData } from "../player-api.js"
import { signalServerAddress } from "../flying-casino.js"

const STARTING_CHIPS = 1000
const STARTING_BET	 = 10
const MAX_PLAYERS		= 4
const SIGNAL_URL		 = signalServerAddress
const params				 = new URLSearchParams(window.location.search)
const isSolo				 = params.has('solo')
const roomId				 = params.get('room') || 'global'

// ── AI Player ──────────────────────────────────────────────────────────────
class PokerAI extends Player {
	constructor(aiIndex) {
		super(msg => this._receive(msg))
		this.aiIndex	 = aiIndex
		this._act			= null	 // set after game is created
		this._hand		 = []
		this._comm		 = []
	}

	setActionFn(fn) { this._act = fn }

	_receive(msg) {
		switch (msg.action) {
			case 'giveHand':
				this._hand = msg.hand.map(c => ({label:c.label, suit:c.suit}))
				break
			case 'gameState':
				this._comm = (msg.communityCards||[]).map(c => ({label:c.label, suit:c.suit}))
				break
			case 'flop':
				this._comm = msg.flopped.map(c => ({label:c.label, suit:c.suit}))
				break
			case 'turn':
				this._comm = [...this._comm, {label:msg.card.label, suit:msg.card.suit}]
				break
			case 'river':
				this._comm = [...this._comm, {label:msg.card.label, suit:msg.card.suit}]
				break
			case 'nextTurn':
				if (msg.toPlay === this.aiIndex)
					setTimeout(() => this._decide(), 900)
				break
		}
	}

	_decide() {
		if (!this._act) return
		const full	= [...this._hand, ...this._comm]
		const ht		= full.length >= 2 ? pokerHandType(full) : 'High Card'
		const coeff = {
			'High Card':20, 'Pair':6, 'Two Pair':5, 'Three of a Kind':4,
			'Straight':3, 'Flush':3, 'Full House':2, 'Four of a Kind':1, 'Straight Flush':1
		}[ht] ?? 10
		const roll = Math.random() * coeff
		if (roll <= 1 && this.chipsRemaining > 100)
			this._act({type:'texasHoldEm', action:'raise', playerIndex:this.aiIndex, raise:50})
		else if (roll <= 4)
			this._act({type:'texasHoldEm', action:'call',	playerIndex:this.aiIndex})
		else
			this._act({type:'texasHoldEm', action:'fold',	playerIndex:this.aiIndex})
	}
}

const playerData = retrievePlayerData()
let myName = playerData?.getName?.() || ''
if (!myName || myName === 'unnamed') myName = 'Player'

// ── State ──────────────────────────────────────────────────────────────────
let network, game, sendToHost
let isHost = false, hostId = null
let myPlayerIndex = -1, playerCount = 0
let players		= []	 // plain data: {name, chipsRemaining, chipsBet, state, hand?}
let myHand		 = []	 // [{label,suit}]
let commCards	= []	 // [{label,suit}]	0–5
let currentBet = STARTING_BET
let toPlayIndex = -1
let blindIndex	= 0
let gamePlayers = []	// host-side Player objects

// ── DOM ────────────────────────────────────────────────────────────────────
const viewLobby		= document.getElementById('view-lobby')
const viewGame		 = document.getElementById('view-game')
const btnCreate		= document.getElementById('btn-create')
const btnStart		 = document.getElementById('btn-start')
const lobbyStatus	= document.getElementById('lobby-status')
const lobbyList		= document.getElementById('lobby-player-list')
const gameLog			= document.getElementById('game-log')
const btnFold			= document.getElementById('btn-fold')
const btnCall			= document.getElementById('btn-call')
const btnRaise		 = document.getElementById('btn-raise')
const raiseInput	 = document.getElementById('raise-input')
const btnNext			= document.getElementById('btn-next-round')
const oppRow			 = document.getElementById('opponents-row')
const commCardsEl	= document.getElementById('community-cards')
const yourTurnHint = document.getElementById('your-turn-hint')

// update lobby self-name display once DOM is ready
const lobbyS = document.getElementById('lobby-self-name')
if (lobbyS) lobbyS.textContent = myName

// ── Card rendering ─────────────────────────────────────────────────────────
const SUIT_SYM		= { Heart:'♥', Diamond:'♦', Club:'♣', Spade:'♠' }
const LABEL_SHORT = {
	Ace:'A', King:'K', Queen:'Q', Jack:'J',
	Two:'2', Three:'3', Four:'4', Five:'5',
	Six:'6', Seven:'7', Eight:'8', Nine:'9', Ten:'10'
}
const shortLbl = l => LABEL_SHORT[l] || l

function makeCard(label, suit, small=false, animate=false) {
	const red = suit==='Heart'||suit==='Diamond'
	const sym = SUIT_SYM[suit]||'?'
	const el	= document.createElement('div')
	el.className = `card ${small?'sm':'lg'} ${red?'red':'black'}${animate?' reveal-anim':''}`
	el.innerHTML =
		`<div class="card-corner top">${shortLbl(label)}<br><span>${sym}</span></div>` +
		`<div class="card-center-suit">${sym}</div>` +
		`<div class="card-corner bot">${shortLbl(label)}<br><span>${sym}</span></div>`
	return el
}

function makeBack(small=false) {
	const el = document.createElement('div')
	el.className = `card card-back${small?' sm':' lg'}`
	return el
}

// ── Rendering ──────────────────────────────────────────────────────────────
function renderMyCards() {
	const el = document.getElementById('my-cards')
	el.innerHTML = ''
	myHand.forEach(c => el.appendChild(makeCard(c.label, c.suit, false, true)))
	updateMyHandType()
}

function updateMyHandType() {
	const el	 = document.getElementById('my-hand-type')
	const full = [...myHand, ...commCards]
	if (full.length < 2) { el.textContent=''; el.className='my-hand-type'; return }
	if (full.length < 5) {
		el.textContent = full.length >= 4 ? pokerHandType(full) : ''
		el.className = 'my-hand-type'; return
	}
	const ht = pokerHandType(full)
	el.textContent = ht
	el.className = `my-hand-type${(pokerHandValueTable[ht]||0) >= 2 ? ' strong' : ''}`
}

function renderCommunityCards() {
	commCardsEl.innerHTML = ''
	for (let i = 0; i < 5; i++) {
		if (i < commCards.length) {
			commCardsEl.appendChild(makeCard(commCards[i].label, commCards[i].suit, false, true))
		} else {
			const ph = document.createElement('div'); ph.className='card-placeholder'
			commCardsEl.appendChild(ph)
		}
	}
	const roundNames = { 0:'Pre-Flop', 3:'Flop', 4:'Turn', 5:'River' }
	document.getElementById('round-label').textContent = roundNames[commCards.length] || 'Pre-Flop'
	updateMyHandType()
}

function updatePot() {
	document.getElementById('pot-amount').textContent =
		players.reduce((s,p) => s+(p.chipsBet||0), 0)
}

function updateMySeat() {
	const p = players[myPlayerIndex]; if (!p) return
	document.getElementById('my-chips').textContent = p.chipsRemaining ?? STARTING_CHIPS
	document.getElementById('my-bet').textContent	 = p.chipsBet || 0
	document.getElementById('my-name').className =
		`my-name-display${toPlayIndex===myPlayerIndex?' active-turn':''}`
}

function buildOpponentSeats() {
	oppRow.innerHTML = ''
	for (let i = 0; i < playerCount; i++) {
		if (i === myPlayerIndex) continue
		const p		= players[i] || {}
		const seat = document.createElement('div')
		seat.className = 'opponent-seat'
		seat.id				= `opp-seat-${i}`
		seat.innerHTML =
			`<div class="opp-name">${escHtml(p.name||`Player ${i}`)}</div>` +
			`<div class="opp-chips-row">` +
				`<div class="opp-chips">$<span id="opp-chips-${i}">${p.chipsRemaining??0}</span></div>` +
				`<div class="opp-bet" id="opp-bet-${i}"></div>` +
			`</div>` +
			`<div class="opp-cards" id="opp-cards-${i}"></div>` +
			`<div class="opp-state" id="opp-state-${i}"></div>`
		const cardsEl = seat.querySelector(`#opp-cards-${i}`)
		cardsEl.appendChild(makeBack(true))
		cardsEl.appendChild(makeBack(true))
		oppRow.appendChild(seat)
	}
}

function updateOpponentSeat(i) {
	const p = players[i]; if (!p) return
	const seat		= document.getElementById(`opp-seat-${i}`)
	const chipsEl = document.getElementById(`opp-chips-${i}`)
	const betEl	 = document.getElementById(`opp-bet-${i}`)
	const stateEl = document.getElementById(`opp-state-${i}`)
	if (chipsEl) chipsEl.textContent = p.chipsRemaining??0
	if (betEl)	 betEl.textContent	 = p.chipsBet ? `bet $${p.chipsBet}` : ''
	if (stateEl) {
		const s = p.state||'none'
		stateEl.textContent = s==='none'?'':s
		stateEl.className	 = `opp-state${s!=='none'?` state-${s}`:''}`
	}
	if (seat) {
		seat.classList.toggle('active-turn', toPlayIndex===i)
		seat.classList.toggle('folded-seat', p.state==='folded')
	}
}

function updateAllSeats() {
	for (let i=0;i<playerCount;i++) if (i!==myPlayerIndex) updateOpponentSeat(i)
	updateMySeat(); updatePot()
}

function revealOppHand(i, hand, handType, isWinner) {
	const cardsEl = document.getElementById(`opp-cards-${i}`)
	const stateEl = document.getElementById(`opp-state-${i}`)
	if (cardsEl) {
		cardsEl.innerHTML = ''
		hand.forEach(c => cardsEl.appendChild(makeCard(c.label, c.suit, true, true)))
	}
	if (stateEl) {
		stateEl.textContent = handType + (isWinner?' ★':'')
		stateEl.className	 = `opp-state${isWinner?' state-winner':''}`
	}
}

function setActionRow(isMyTurn) {
	yourTurnHint.classList.toggle('hidden', !isMyTurn)
	btnFold.disabled = btnCall.disabled = btnRaise.disabled = raiseInput.disabled = !isMyTurn
	if (isMyTurn) {
		const toCall = Math.max(0, currentBet-(players[myPlayerIndex]?.chipsBet||0))
		btnCall.textContent = toCall===0?'Check':`Call $${toCall}`
		raiseInput.value = ''
		raiseInput.placeholder = `+${STARTING_BET}`
	}
}

function log(text, cls='') {
	const p = document.createElement('p')
	p.textContent = text; if (cls) p.className = cls
	gameLog.insertBefore(p, gameLog.firstChild)
}

function escHtml(s) {
	return String(s).replace(/[&<>"']/g, c =>
		({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])
	)
}

// ── Extract plain data from a player (works with full objects or JSON) ─────
function pdata(p) {
	if (!p) return {}
	return {
		name:					 p.name,
		chipsRemaining: p.chipsRemaining,
		chipsBet:			 p.chipsBet,
		state:					p.state,
		hand:					 p.hand ? p.hand.map(c=>({label:c.label,suit:c.suit})) : undefined
	}
}

// ── Game message handler ───────────────────────────────────────────────────
function receiveGameMessage(msg) {
	switch (msg.action) {

		case 'giveHand':
			myHand = msg.hand.map(c=>({label:c.label,suit:c.suit}))
			renderMyCards()
			break

		case 'gameState':
			currentBet	= msg.currentBet ?? currentBet
			toPlayIndex = msg.toPlay		 ?? toPlayIndex
			for (let i=0;i<msg.players.length;i++)
				players[i] = {...(players[i]||{}), ...pdata(msg.players[i])}
			if ((msg.communityCards?.length||0) > commCards.length) {
				commCards = msg.communityCards.map(c=>({label:c.label,suit:c.suit}))
				renderCommunityCards()
			}
			updateAllSeats()
			setActionRow(toPlayIndex===myPlayerIndex)
			break

		case 'flop':
			commCards = msg.flopped.map(c=>({label:c.label,suit:c.suit}))
			renderCommunityCards()
			log('— Flop —', 'log-round')
			break

		case 'turn':
			commCards.push({label:msg.card.label,suit:msg.card.suit})
			renderCommunityCards()
			log('— Turn —', 'log-round')
			break

		case 'river':
			commCards.push({label:msg.card.label,suit:msg.card.suit})
			renderCommunityCards()
			log('— River —', 'log-round')
			break

		case 'nextTurn':
			toPlayIndex = msg.toPlay
			updateAllSeats()
			setActionRow(toPlayIndex===myPlayerIndex)
			if (toPlayIndex===myPlayerIndex) log('Your turn.')
			else log(`${players[msg.toPlay]?.name||`Player ${msg.toPlay}`}'s turn.`)
			break

		case 'playerRaised': {
			players[msg.playerIndex] = {...(players[msg.playerIndex]||{}), ...pdata(msg.player), state:'raised'}
			updateOpponentSeat(msg.playerIndex); updateMySeat(); updatePot()
			const n = players[msg.playerIndex]?.name||`Player ${msg.playerIndex}`
			log(`${n} raised $${msg.raiseAmount}.`, 'log-action')
			break
		}

		case 'playerCalled': {
			players[msg.playerIndex] = {...(players[msg.playerIndex]||{}), ...pdata(msg.player), state:'called'}
			updateOpponentSeat(msg.playerIndex); updateMySeat(); updatePot()
			const n = players[msg.playerIndex]?.name||`Player ${msg.playerIndex}`
			log(`${n} called.`, 'log-action')
			break
		}

		case 'playerFolded':
			players[msg.playerIndex] = {...(players[msg.playerIndex]||{}), state:'folded'}
			updateOpponentSeat(msg.playerIndex)
			log(`${players[msg.playerIndex]?.name||`Player ${msg.playerIndex}`} folded.`, 'log-action')
			break

		case 'showHand': {
			const pd = pdata(msg.player)
			players[msg.ownerIndex] = {...(players[msg.ownerIndex]||{}), ...pd}
			if (msg.ownerIndex!==myPlayerIndex && pd.hand) {
				revealOppHand(msg.ownerIndex, pd.hand, msg.handType, false)
			} else if (msg.ownerIndex===myPlayerIndex) {
				const el = document.getElementById('my-hand-type')
				el.textContent = msg.handType
				el.className = `my-hand-type${(pokerHandValueTable[msg.handType]||0)>=2?' strong':''}`
			}
			const n = pd.name||`Player ${msg.ownerIndex}`
			log(`${n}: ${msg.handType}`)
			break
		}

		case 'revealedWinners':
			document.getElementById('round-label').textContent = 'Showdown'
			setActionRow(false)
			msg.winners.forEach(w => {
				const i = players.findIndex(p=>p.name===w.name)
				if (i>=0 && i!==myPlayerIndex) {
					const el = document.getElementById(`opp-state-${i}`)
					LocalPlayerData.giveWins();
					LocalPlayerData.giveChips(parseInt(document.getElementById('pot-amount').textContent));
					if (el) { el.textContent='★ Winner'; el.className='opp-state state-winner' }
				}
				log(`${w.name||'Unknown'} wins the pot!`, 'log-win')
			})
			updateAllSeats()
			if (isHost) btnNext.classList.remove('hidden')
			break
	}
}

// ── Lobby helpers ──────────────────────────────────────────────────────────
function addLobbyEntry(name, chips, isSelf=false) {
	const li = document.createElement('li')
	li.className = `lobby-player${isSelf?' self':''}`
	const nid = isSelf ? ' id="lobby-self-name"' : ''
	li.innerHTML =
		`<span><span${nid}>${escHtml(name)}</span>${isSelf?' <em style="opacity:.4">(you)</em>':''}</span>` +
		`<span class="lobby-player-chips">$${chips}</span>`
	lobbyList.appendChild(li)
}

function refreshCount() {
	const n = lobbyList.children.length
	document.getElementById('lobby-count').textContent = `${n} / ${MAX_PLAYERS} players`
	btnStart.textContent = `Start Game (${n})`
}

function initGameView() {
	viewLobby.classList.add('hidden')
	viewGame.classList.remove('hidden')
	document.getElementById('my-name').textContent	= myName
	document.getElementById('my-chips').textContent = players[myPlayerIndex]?.chipsRemaining ?? STARTING_CHIPS
	buildOpponentSeats()
	if (isHost && !isSolo) { log('You are the host — click Next Round to deal.'); btnNext.classList.remove('hidden') }
}

function startNewRound() {
	commCards = []; myHand = []; toPlayIndex = -1
	document.getElementById('my-cards').innerHTML			 = ''
	document.getElementById('my-hand-type').textContent = ''
	document.getElementById('my-hand-type').className	 = 'my-hand-type'
	renderCommunityCards()
	setActionRow(false)
	btnNext.classList.add('hidden')
	for (const p of gamePlayers) { p.chipsBet=0; p.state='none'; p.hand=null }
	players = gamePlayers.map(p => pdata(p))
	buildOpponentSeats(); updateAllSeats()
	game = new TexasHoldEm(gamePlayers, STARTING_BET)
	sendToHost = obj => game.receiveAction(obj)
	// Re-attach AI action function after new game instance is created
	for (const p of gamePlayers) {
		if (p instanceof PokerAI) p.setActionFn(obj => game.receiveAction(obj))
	}
	game.ante(blindIndex)
	blindIndex = (blindIndex+1) % gamePlayers.length
	log('— New Round —', 'log-round')
}

// ── Solo mode setup ────────────────────────────────────────────────────────
if (isSolo) {
	document.getElementById('lobby-btns-multi').classList.add('hidden')
	document.getElementById('lobby-btns-solo').classList.remove('hidden')
	document.getElementById('lobby-player-list').classList.add('hidden')
	document.getElementById('lobby-count').classList.add('hidden')
	document.getElementById('lobby-status').classList.add('hidden')
	document.querySelector('#view-lobby .lobby-subtitle').textContent = 'vs Computer'
	addLobbyEntry(myName||'Player', STARTING_CHIPS, true)

	document.getElementById('btn-play-solo').onclick = () => {
		isHost = true; myPlayerIndex = 0; playerCount = 2

		const me = new Player(obj => receiveGameMessage(obj))
		me.chipsRemaining = STARTING_CHIPS; me.name = myName

		const ai = new PokerAI(1)
		ai.chipsRemaining = STARTING_CHIPS; ai.name = 'Dealer'

		gamePlayers = [me, ai]
		players		 = gamePlayers.map(p => pdata(p))

		game			= new TexasHoldEm(gamePlayers, STARTING_BET)
		sendToHost = obj => game.receiveAction(obj)
		ai.setActionFn(obj => game.receiveAction(obj))

		initGameView()
		game.ante(blindIndex)
		blindIndex = 1
	}
}

// ── Network + multiplayer buttons (skipped in solo mode) ──────────────────
if (!isSolo) {
	network = await constructNetworkAPI(SIGNAL_URL, roomId)
	addLobbyEntry(myName||'Player', STARTING_CHIPS, true)
	refreshCount()
	lobbyStatus.textContent = "Connected. Create a game or wait for a host."

	network.onmessage = (ev) => {
		const msg = JSON.parse(ev.data)
		switch (msg.type) {

			case 'holdEmStart':
				if (hostId||isHost) break
				hostId = msg.from; btnCreate.disabled = true
				lobbyStatus.textContent = 'Joining…'
				if (!myName) myName = nameInputEl.value.trim()||'Player'
				network.sendObject({type:'holdEmJoin', chips:STARTING_CHIPS, name:myName}, hostId)
				break

			case 'holdEmJoin':
				if (!isHost||gamePlayers.length>=MAX_PLAYERS) break
				{
					const p = new Player(obj => { try { network.sendObject(obj, msg.from) } catch {} })
					p.chipsRemaining = Number(msg.chips)||STARTING_CHIPS
					p.name					 = msg.name||msg.from.slice(0,8)
					gamePlayers.push(p); players.push(pdata(p))
					addLobbyEntry(p.name, p.chipsRemaining); refreshCount()
					if (gamePlayers.length>=2) btnStart.disabled=false
					lobbyStatus.textContent = gamePlayers.length>=MAX_PLAYERS ? 'Table full!' : `${gamePlayers.length} player(s) ready…`
				}
				break

			case 'holdEmInit':
				myPlayerIndex = msg.playerIndex
				playerCount	 = msg.players.length
				players			 = msg.players.map(p => pdata(p))
				hostId				= msg.from
				sendToHost		= obj => network.sendObject(obj, msg.from)
				initGameView()
				break

			case 'texasHoldEm':
				if (isHost && ['fold','call','raise'].includes(msg.action))
					game.receiveAction(msg)
				else
					receiveGameMessage(msg)
				break
		}
	}

	btnCreate.onclick = () => {
		if (isHost||hostId) return
		isHost=true; btnCreate.disabled=true; gamePlayers=[]
		myPlayerIndex=0
		const me = new Player(obj => receiveGameMessage(obj))
		me.chipsRemaining=STARTING_CHIPS; me.name=myName
		gamePlayers.push(me); players.push(pdata(me))
		network.broadcastObject({type:'holdEmStart'})
		lobbyStatus.textContent='Waiting for players… (need 1 more)'
		btnStart.textContent='Start Game (1)'
	}

	btnStart.onclick = () => {
		if (!isHost||gamePlayers.length<2) return
		playerCount = gamePlayers.length
		players		 = gamePlayers.map(p => pdata(p))
		const pd		= gamePlayers.map(p => pdata(p))
		for (let i=1;i<gamePlayers.length;i++)
			gamePlayers[i].send({type:'holdEmInit', players:pd, playerIndex:i})
		game			= new TexasHoldEm(gamePlayers, STARTING_BET)
		sendToHost = obj => game.receiveAction(obj)
		initGameView()
		game.ante(blindIndex)
		blindIndex=(blindIndex+1)%gamePlayers.length
	}
}

// ── Action buttons (solo + multi) ──────────────────────────────────────────
btnFold.onclick	= () => sendToHost?.({type:'texasHoldEm', action:'fold',	playerIndex:myPlayerIndex})
btnCall.onclick	= () => sendToHost?.({type:'texasHoldEm', action:'call',	playerIndex:myPlayerIndex})
btnRaise.onclick = () => {
	const amt = Number(raiseInput.value); if (amt<=0) return
	sendToHost?.({type:'texasHoldEm', action:'raise', playerIndex:myPlayerIndex, raise:amt})
}
btnNext.onclick	= () => { if (isHost) startNewRound() }

// ── Cursor ─────────────────────────────────────────────────────────────────
const cursor = document.getElementById('cursor')
document.addEventListener('mousemove', e => { cursor.style.left=e.clientX+'px'; cursor.style.top=e.clientY+'px' })
const hsel = 'button:not(:disabled), a, .ball, input'
document.addEventListener('mouseover', e => {
	if (e.target.matches(hsel)||e.target.closest(hsel))
		{ cursor.style.width='16px'; cursor.style.height='16px'; cursor.style.background='var(--gold)' }
})
document.addEventListener('mouseout', e => {
	if (e.target.matches(hsel)||e.target.closest(hsel))
		{ cursor.style.width='8px'; cursor.style.height='8px'; cursor.style.background='var(--white-ball)' }
})

// ── Felt ripple ────────────────────────────────────────────────────────────
document.getElementById('felt').addEventListener('click', e => {
	if (e.target.closest('button,a,input')) return
	const rect=document.getElementById('felt').getBoundingClientRect()
	const r=document.createElement('div')
	r.style.cssText=`position:absolute;left:${e.clientX-rect.left}px;top:${e.clientY-rect.top}px;width:4px;height:4px;border:2px solid rgba(255,255,255,0.4);border-radius:50%;pointer-events:none;animation:rippleOut 0.65s ease-out forwards;transform:translate(-50%,-50%);`
	document.getElementById('felt').appendChild(r); setTimeout(()=>r.remove(),750)
})

// ── Ball jiggle ────────────────────────────────────────────────────────────
document.querySelectorAll('.ball').forEach(b => {
	b.addEventListener('mouseenter',function(){this.style.transition='transform 0.15s';this.style.transform=`translate(${(Math.random()-.5)*10}px,${(Math.random()-.5)*10}px) scale(1.18)`})
	b.addEventListener('mouseleave',function(){this.style.transform=''})
})
