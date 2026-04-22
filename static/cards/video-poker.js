import { VideoPoker } from './poker.js'

// ── DISPLAY MAPS ──
const LABEL_SHORT = {
	Ace:"A", Two:"2", Three:"3", Four:"4", Five:"5",
	Six:"6", Seven:"7", Eight:"8", Nine:"9", Ten:"10",
	Jack:"J", Queen:"Q", King:"K"
}
const SUIT_SYMBOL = { Heart:"♥", Diamond:"♦", Club:"♣", Spade:"♠" }
const RED_SUITS = new Set(["Heart", "Diamond"])

// ── PAYOUTS (matching poker.js endGame logic) ──
const PAYOUTS = {
	"Two Pair": 2, "Three of a Kind": 3,
	"Straight": 8, "Flush": 8, "Full House": 10,
	"Four of a Kind": 15, "Straight Flush": 20, "Five of a Kind": 50
}

// ── STATE ──
let chips = 100
let phase = "bet"   // "bet" | "hold" | "result"
const game = new VideoPoker()

// ── DOM ──
const chipCount = document.getElementById("chip-count")
const betInput  = document.getElementById("bet-input")
const dealBtn   = document.getElementById("deal-btn")
const cardHint  = document.getElementById("card-hint")
const resultMsg = document.getElementById("result-msg")
const cardEls   = [0,1,2,3,4].map(i => document.getElementById(`card-${i}`))

// ── CARD RENDERING ──
function renderCard(el, card, i, animate) {
	const isRed = RED_SUITS.has(card.suit)
	const val = LABEL_SHORT[card.label]
	const sym = SUIT_SYMBOL[card.suit]
	el.className = `playing-card ${isRed ? "red-card" : "black-card"}${animate ? " dealing" : ""}`
	el.style.animationDelay = animate ? `${i * 55}ms` : ""
	el.dataset.held = "false"
	el.innerHTML = `
		<div class="card-corner tl">
			<div class="card-value">${val}</div>
			<div class="card-suit-pip">${sym}</div>
		</div>
		<div class="card-center">${sym}</div>
		<div class="card-corner br">
			<div class="card-value">${val}</div>
			<div class="card-suit-pip">${sym}</div>
		</div>
		<div class="hold-label">Hold</div>
	`
}

function clearCard(el) {
	el.className = "playing-card empty"
	el.style.animationDelay = ""
	el.innerHTML = ""
	el.dataset.held = "false"
}

// ── PAYOUT HIGHLIGHT ──
function highlightPayout(hand) {
	document.querySelectorAll(".payout-item").forEach(el =>
		el.classList.toggle("active", el.dataset.hand === hand))
}
function clearPayout() {
	document.querySelectorAll(".payout-item").forEach(el => el.classList.remove("active"))
}

// ── HAND EVALUATION ──
function evalHand(hand) {
	const ORDER = ["Two","Three","Four","Five","Six","Seven","Eight",
					"Nine","Ten","Jack","Queen","King","Ace"]
	const counts = {}
	let flush = true
	const firstSuit = hand[0].suit
	hand.forEach(c => {
		counts[c.label] = (counts[c.label] || 0) + 1
		if (c.suit !== firstSuit) flush = false
	})
	const sorted = Object.values(counts).sort((a, b) => b - a)
	const idxs = hand.map(c => ORDER.indexOf(c.label)).sort((a, b) => a - b)
	const allUnique = new Set(idxs).size === 5
	const straight = (allUnique && idxs[4] - idxs[0] === 4)
		|| (idxs[4] === 12 && idxs[0] === 0 && idxs[1] === 1 && idxs[2] === 2 && idxs[3] === 3)

	if (sorted[0] >= 5)                        return "Five of a Kind"
	if (flush && straight)                     return "Straight Flush"
	if (sorted[0] >= 4)                        return "Four of a Kind"
	if (sorted[0] >= 3 && sorted[1] >= 2)     return "Full House"
	if (flush)                                 return "Flush"
	if (straight)                              return "Straight"
	if (sorted[0] >= 3)                        return "Three of a Kind"
	if (sorted[0] >= 2 && sorted[1] >= 2)     return "Two Pair"
	if (sorted[0] >= 2)                        return "Pair"
	return "High Card"
}

// ── BET VALIDATION ──
betInput.addEventListener("input", () => {
	const v = Number(betInput.value)
	dealBtn.disabled = !(v >= 1 && v <= chips && Number.isInteger(v))
})

// ── CARD HOLD TOGGLE ──
cardEls.forEach((el, i) => {
	el.addEventListener("click", () => {
		if (phase !== "hold" || el.classList.contains("empty")) return
		const held = el.dataset.held === "true"
		el.dataset.held = String(!held)
		el.classList.toggle("held", !held)
	})
})

// ── MAIN BUTTON ──
dealBtn.addEventListener("click", () => {
	if      (phase === "bet")    startDeal()
	else if (phase === "hold")   draw()
	else if (phase === "result") newHand()
})

function startDeal() {
	const bet = Number(betInput.value)
	chips -= bet
	chipCount.textContent = chips

	clearPayout()
	resultMsg.textContent = ""
	cardHint.textContent = "Click cards to hold, then Draw"

	game.reset()
	game.deal()
	for (let i = 0; i < 5; i++) renderCard(cardEls[i], game.hand[i], i, true)

	phase = "hold"
	betInput.disabled = true
	dealBtn.textContent = "Draw"
	dealBtn.disabled = false
}

function draw() {
	for (let i = 0; i < 5; i++) {
		if (cardEls[i].dataset.held !== "true") {
			game.discard(i)
			renderCard(cardEls[i], game.hand[i], i, true)
		}
	}

	cardHint.textContent = ""
	const hand = evalHand(game.hand)
	highlightPayout(hand)

	const bet = Number(betInput.value)
	if (PAYOUTS[hand]) {
		const win = bet * PAYOUTS[hand]
		chips += win
		chipCount.textContent = chips
		resultMsg.textContent = `${hand}! You win ${win} chips.`
	} else {
		resultMsg.textContent = `${hand} — no payout.`
	}

	phase = "result"
	dealBtn.textContent = "New Hand"
	dealBtn.disabled = chips <= 0

	if (chips <= 0) {
		resultMsg.textContent += " No chips remaining."
		betInput.disabled = true
	}
}

function newHand() {
	phase = "bet"
	cardEls.forEach(clearCard)
	clearPayout()
	resultMsg.textContent = ""
	cardHint.textContent = ""
	betInput.disabled = false
	betInput.value = ""
	dealBtn.textContent = "Deal"
	dealBtn.disabled = true
}

// ── CUSTOM CURSOR ──
const cursor = document.getElementById("cursor")
document.addEventListener("mousemove", e => {
	cursor.style.left = e.clientX + "px"
	cursor.style.top  = e.clientY + "px"
})
const hoverSel = ".playing-card:not(.empty), .deal-btn:not(:disabled), .bet-input, .back-link, .ball"
document.addEventListener("mouseover", e => {
	if (e.target.matches(hoverSel) || e.target.closest(hoverSel)) {
		cursor.style.width = "16px"
		cursor.style.height = "16px"
		cursor.style.background = "var(--gold)"
	}
})
document.addEventListener("mouseout", e => {
	if (e.target.matches(hoverSel) || e.target.closest(hoverSel)) {
		cursor.style.width = "8px"
		cursor.style.height = "8px"
		cursor.style.background = "var(--white-ball)"
	}
})

// ── FELT RIPPLE ──
const felt = document.getElementById("felt")
felt.addEventListener("click", e => {
	if (e.target.closest(".playing-card, .deal-btn, .bet-input, .back-link")) return
	const rect = felt.getBoundingClientRect()
	const r = document.createElement("div")
	r.style.cssText = `
		position: absolute;
		left: ${e.clientX - rect.left}px;
		top: ${e.clientY - rect.top}px;
		width: 4px; height: 4px;
		border: 2px solid rgba(255,255,255,0.4);
		border-radius: 50%;
		pointer-events: none;
		animation: rippleOut 0.65s ease-out forwards;
		transform: translate(-50%, -50%);
	`
	felt.appendChild(r)
	setTimeout(() => r.remove(), 750)
})

// ── BALL JIGGLE ──
document.querySelectorAll(".ball").forEach(b => {
	b.addEventListener("mouseenter", () => b.style.transform = "scale(1.18)")
	b.addEventListener("mouseleave", () => b.style.transform = "")
})