import {Deck} from "./deck.js"



export function pokerHandType(hand) {
	var labelCounts = {
		"Ace" : 0,
		"Two" : 0,
		"Three" : 0,
		"Four" : 0,
		"Five" : 0,
		"Six" : 0,
		"Seven" : 0,
		"Eight" : 0,
		"Nine" : 0,
		"Ten" : 0,
		"Jack" : 0,
		"Queen" : 0,
		"King" : 0
	}

	var suitCounts = {
		"Spade": [],
		"Heart": [],
		"Club": [],
		"Diamond": []
	}
	
	hand.forEach(card => {
		labelCounts[card.label]++
		suitCounts[card.suit].push(card)
	});

	var sortedCount = Object.entries(labelCounts).sort((a,b) => b[1] - a[1])
	


	var isStraight = false
	var isFlush = false

	let handsToStraighten = []
	// If we have a flush, then we only care if straights are flushes.
	for (const validSuit of Object.entries(suitCounts)) {
		if (validSuit[1].length >= 5) {
			isFlush = true
			handsToStraighten.push(validSuit[1])
		}
	}

	// If we don't have flushes, we care about our hand.
	if (handsToStraighten.length == 0) {handsToStraighten.push(hand)}

	for (const handToStraighten of handsToStraighten) {
		var count = 0
		// From highest to lowest
		let straightenedHand = [...handToStraighten].sort((a,b) => b.value - a.value)
		
		let lastCard = straightenedHand[0]
		for (const card of straightenedHand) {
			if (lastCard.value == card.value) {lastCard = card; continue}

			if (lastCard.value-1 != card.value) {count = 0; lastCard = card; continue}
			else {
				count++
				if (count >= 4) {
					isStraight = true
					break
				}
			}
			lastCard = card
		}
		
		// Just due to how annoying straight wrap arounds are, and their rarity, I've handled it specially here.
		if (!isStraight && straightenedHand[0].label == "Ace" && straightenedHand[straightenedHand.length-1].label == "Two") {
			lastCard = straightenedHand[0]
			count++ // Because by definition we have an extra Ace now
			if (count >= 4) {
				isStraight = true
				break
			}
			
			// As count counted how many led up to the wrap-around, we just do the forEach again but exit instead of resetting.
			for (const card of straightenedHand) {
				if (lastCard.value == card.value) {lastCard = card; continue}

				if (lastCard.value-1 != card.value) {break}
				else {
					count++
					if (count >= 4) {
						isStraight = true
						break
					}
				}
				lastCard = card
			}
		}
	}

	if (sortedCount[0][1] >= 5) {return "Five of a Kind"}
	if (isFlush && isStraight) {return "Straight Flush"}
	if (sortedCount[0][1] >= 4) {return "Four of a Kind"}
	if (sortedCount[0][1] >= 3 && sortedCount[1][1] >= 2) {return "Full House"}
	if (isFlush) {return "Flush"}
	if (isStraight) {return "Straight"}
	if (sortedCount[0][1] >= 3) {return "Three of a Kind"}
	if (sortedCount[0][1] >= 2 && sortedCount[1][1] >= 2) {return "Two Pair"}
	if (sortedCount[0][1] >= 2) {return "Pair"}
	return "High Card"
}

export const pokerHandValueTable = {
	"High Card" : 0,
	"Pair" : 1,
	"Two Pair" : 2,
	"Three of a Kind": 3,
	"Straight" : 4,
	"Flush" : 5,
	"Full House" : 6,
	"Four of a Kind" : 7,
	"Straight Flush" : 8,
	"Five of a Kind" : 9
}

export const pokerCardValueTable = {
	"Ace" : 14,
	"Two" : 2,
	"Three" : 3,
	"Four" : 4,
	"Five" : 5,
	"Six" : 6,
	"Seven" : 7,
	"Eight" : 8,
	"Nine" : 9,
	"Ten" : 10,
	"Jack" : 11,
	"Queen" : 12,
	"King" : 13
}


// My shame. A copy and paste of pokerHandType, but with extra logic to find what makes up our winning hand. 
// Likely should have made the scoring system in its entirity, with pokerHandType accounting for this
// But oh well. Having two specific functions for each isn't too egregious anyway
export function handScore(hand) {
	var labelCounts = {
		"Ace" : 0,
		"Two" : 0,
		"Three" : 0,
		"Four" : 0,
		"Five" : 0,
		"Six" : 0,
		"Seven" : 0,
		"Eight" : 0,
		"Nine" : 0,
		"Ten" : 0,
		"Jack" : 0,
		"Queen" : 0,
		"King" : 0
	}

	var suitCounts = {
		"Spade": [],
		"Heart": [],
		"Club": [],
		"Diamond": []
	}
	
	hand.forEach(card => {
		labelCounts[card.label]++
		suitCounts[card.suit].push(card)
	});

	var sortedCount = Object.entries(labelCounts).sort((a,b) =>
		b[1] - a[1]
		|| pokerCardValueTable[b[0]] - pokerCardValueTable[a[0]] // If equal, what has more value?
	)
	
	var handsToStraighten = []
	// If we have a flush, then we only care if straights are flushes.
	var isFlush = false
	for (const validSuit of Object.entries(suitCounts)) {
		if (validSuit[1].length >= 5) {
			handsToStraighten.push(validSuit[1])
			isFlush = true
		}
	}
	if (handsToStraighten.length == 0) {handsToStraighten.push(hand)}


	var isStraight = 0 // False, or our score.
	for (const handToStraighten of handsToStraighten) {
		let straightenedHand = [...handToStraighten].sort((a,b) => b.value - a.value)
		let lastCard = straightenedHand[0]
		let notWrappedisStraight = lastCard.value
		let count = 0
		for (const card of straightenedHand) {
			if (lastCard.value == card.value) {lastCard = card; continue}

			if (lastCard.value-1 != card.value) {count = 0; notWrappedisStraight = card.value; lastCard = card; continue}
			
			count++
			notWrappedisStraight += card.value
			if (count >= 4) {
				break
			}

			lastCard = card
		}

		// If we didn't count up to a straight, then we didn't get one, did we?
		if (count < 4) {notWrappedisStraight = 0}
		
		// Just due to how annoying straight wrap arounds are, and their rarity, I've handled it specially here.
		if (straightenedHand[0].label == "Ace" && straightenedHand[straightenedHand.length-1].label == "Two") {
			// We have very very annoying logic here as this could be higher than the hand we priorly got,
			// EX: 7+6+5+4+3 = 25 priorly, but if wrapped could be Ace+2+3+4+5 = 28
			// Thus, we have to count again, and check if this is bigger than the prior.
			// This logic is overkill, as in application we only have 2->8 & ace, as the most extreme poker has 8 cards
			// But I want this function to be entirely robust, just in case. 
			let wrapAroundCount = 0
			let wrapAroundLastCard = straightenedHand[0]
			let isStraightWrapAround = straightenedHand[0].value

			// We first see how many the larger cards we have
			for (const card of straightenedHand) {
				if (wrapAroundLastCard.value == card.value) {wrapAroundLastCard = card; continue}

				if (wrapAroundLastCard.value-1 != card.value) {break}
				
				wrapAroundCount++
				isStraightWrapAround += card.value

				wrapAroundLastCard = card
			}

			// Then, we check the smallest cards we have
			let reversedStraight = structuredClone(straightenedHand).reverse()
			let wrapAroundLastCard2 = reversedStraight[0]
			wrapAroundCount++
			isStraightWrapAround += wrapAroundLastCard2.value

			for (const card of reversedStraight) {
				if (wrapAroundLastCard2.value == card.value) {wrapAroundLastCard2 = card; continue}

				if (wrapAroundLastCard2.value+1 != card.value) {break}
				
				wrapAroundCount++
				isStraightWrapAround += card.value
				if (wrapAroundCount >= 4) {
					break
				}
				wrapAroundLastCard2 = card
			}
			
			if (wrapAroundCount < 4) {isStraightWrapAround = 0}

			if (isStraightWrapAround > notWrappedisStraight) {isStraight = isStraightWrapAround}
		}
		if (notWrappedisStraight > isStraight) {isStraight = notWrappedisStraight}
	}

	if (sortedCount[0][1] >= 5) {return (pokerCardValueTable[sortedCount[0][0]]*5)} // Five of a kind
	if (isFlush && isStraight > 0) {return isStraight} // Straight Flush
	if (sortedCount[0][1] >= 4) {return (pokerCardValueTable[sortedCount[0][0]]*4)} // Four of a kind
	if (sortedCount[0][1] >= 3 && sortedCount[1][1] >= 2) { // Full house
		return ((pokerCardValueTable[sortedCount[0][0]]*3) + (pokerCardValueTable[sortedCount[1][0]]*2))
	}

	if (isFlush) { // Flush
		let score = 0
		for (const handToStraighten of handsToStraighten) { // If isFlush, handsToStraighten is flush cards
			let straightenedHand = structuredClone(hand).sort((a,b) => b.value - a.value)
			let newScore = 0
			let i = 0
			for (const card of straightenedHand) {
				i++
				newScore += card.value
				if (i >= 5) {break}
			}
			if (newScore > score) {score = newScore}
		}
		return score
	}

	if (isStraight > 0) {return isStraight} // Straight
	if (sortedCount[0][1] >= 3) {return (pokerCardValueTable[sortedCount[0][0]]*3)} // Three of a kind
	if (sortedCount[0][1] >= 2 && sortedCount[1][1] >= 2) { // Two pair
		return ((pokerCardValueTable[sortedCount[0][0]]*2) + (pokerCardValueTable[sortedCount[1][0]]*2))
	}
	if (sortedCount[0][1] >= 2) {return (pokerCardValueTable[sortedCount[0][0]]*2)} // Pair
	return (pokerCardValueTable[sortedCount[0][0]]) // High card
}




// Class to be extended for any individual poker game.
// Thus, it mainly handles Poker values 
export class Poker extends Deck {
	constructor(handSize) {
		super(handSize)

		// For poker, these cards have different higher values than normal.
		// This is a messy fix, but it's just how the Deck class wants us to interface for now.
		// Easy enough to refactor later here in any case!
	    this.JD.value = 11
	    this.QD.value = 12
	    this.KD.value = 13
		this.AD.value = 14

		this.JC.value = 11
		this.QC.value = 12
		this.KC.value = 13
		this.AC.value = 14

		this.JH.value = 11
		this.QH.value = 12
		this.KH.value = 13
		this.AH.value = 14

		this.JS.value = 11
		this.QS.value = 12
		this.KS.value = 13
		this.AS.value = 14
	}
}



export class VideoPoker extends Poker {
	constructor() {
		super(5)
	}

	deal() {
		this.shuffle()
        for (let j = 0; j < this.handSize; j++) {
            this.#hand[j] = this.cards.pop();
        }
	}

	discard(index) {
		this.#hand[index] = this.cards.pop()
	}

	get hand() {return this.#hand}
	#hand = [] // Video poker is inherently a single player game. Therefore, there is just one hand.
}


// Although maybe wrong to write HTML in JavaScript, I think doing it this way is benign as writing JSON is.
// Particularly, its notable that this stuff is just what the handler's responsibilities are via game events.
// Any worries about this being properly presentable are thus to be handled by the handlers caller.
const videoPokerHTML = `
<span class="currentChips" id="videoPokerCurrentChips"></span>
<input class="betInput" id="videoPokerBetInput"></input>
<button class="dealButton" id="videoPokerDealButton"></button>
<ul class="hand" id="videoPokerHand"></ul>
<div class="gameOutput" id="videoPokerOutput"></div>
`

// I believe we might have a better design for this, where the HTML Handler is inherited,
// But for now, I just want to have some HTMLHandler for video poker.
// Thus, I've made it this class to be somewhat more easily refactored later.
// And please, do feel free to refactor this if you want to!
export class VideoPokerHTMLHandler {
	// Arbitrarily accessible class attributes for easy access to DOM elements.
	currentChips
	betInput
	dealButton
	hand
	output

	constructor(document, container) {
		container.insertAdjacentHTML("beforeend", videoPokerHTML)

		this.document = document
		this.currentChips = document.getElementById("videoPokerCurrentChips")
		this.betInput = document.getElementById("videoPokerBetInput")
		this.dealButton = document.getElementById("videoPokerDealButton")
		this.hand = document.getElementById("videoPokerHand")
		this.output = document.getElementById("videoPokerOutput")
		
		this.videoPoker = new VideoPoker()

		this.dealButton.disabled = true

		this.betInput.addEventListener("input", () => {
			var betValue = Number(this.betInput.value)

			if (betValue > 0 && betValue <= Number(this.currentChips.textContent)) {
				this.dealButton.disabled = false
			} else {
				this.dealButton.disabled = true
				this.outputString("<p>Bet must be within your current amount of chips!</p>")			
			}
		})

		this.dealButton.onclick = () => {
			if (!this.betInput.disabled) {
				this.hand.innerHTML = "" // Put here at start of game, so at end of game you can take time to admire your hand.
				this.play()
				this.betInput.disabled = true
			} else {
				this.discard()
				this.betInput.disabled = false
				this.endGame()
			}
		}
	}



	outputString(string) {
		const newOutput = document.createElement("p")
		newOutput.innerHTML = string
		this.output.appendChild(newOutput)
	}



	play() {
		this.currentChips.textContent = Number(this.currentChips.textContent) - Number(this.betInput.value)
		if (this.currentChips.text < 0) {
			this.currentChips.textContent = Number(this.currentChips.textContent) + Number(this.betInput.value)
			throw RangeError(`currentChips is less than current bet!`)
		}

		this.videoPoker
		this.videoPoker.deal()
		
		for (let i = 0; i < this.videoPoker.hand.length; i++) {
			const card = this.document.createElement("li")
			card.classList.add("card")
			card.dataset.label = this.videoPoker.hand[i].label
			card.dataset.suit = this.videoPoker.hand[i].suit
			card.dataset.selected = "FALSE"

			card.addEventListener("click", () => {
				if (card.dataset.selected != "TRUE") {
					card.dataset.selected = "TRUE"
				} else {
					card.dataset.selected = "FALSE"
				}
			})

			card.dataset.index = i
			this.hand.appendChild(card)
		}
	}



	discard() {
		const cards = this.hand.querySelectorAll("li")
		cards.forEach(card => {
			if (card.dataset.selected == "TRUE") {
				this.videoPoker.discard(card.dataset.index)
				card.dataset.label = this.videoPoker.hand[card.dataset.index].label
				card.dataset.suit = this.videoPoker.hand[card.dataset.index].suit
			}
		})
	}


	
	endGame() {
		var pokerHand = pokerHandType(this.videoPoker.hand)
		var winnings = Number(this.betInput.value)
		switch(pokerHand) {
			case "Pair": case "High Card":
				this.outputString("You lost the hand")
				return
			// In video poker, different hands give different payouts! 
			case "Two Pair": winnings = winnings*2; break;
			case "Three of a Kind": winnings = winnings * 3; break;
			case "Straight": case "Flush": winnings = winnings * 8; break;
			case "Full House": winnings = winnings * 10; break;
			case "Four of a Kind": winnings = winnings * 15; break;
			case "Straight Flush": winnings = winnings * 20; break;
			case "Five of a Kind": winnings = winnings * 50; break;
		}

		this.currentChips.textContent = Number(this.currentChips.textContent) + winnings
		this.outputString(`You got a ${pokerHand}! You won ${winnings} chips!`)
	}
}






// Though maybe self-evident, to help understanding, note that Pot exists primarily due to the fact someone can run out of chips.
// If someone raises when someone has gone all-in, then the all-in person has an issue in that they cannot dedicate more chips to call.
// In this case then, raises have to go into another sidePot, which the all-in does not get the winnings of since they did not dedicate to it.
// So, that causes some decently complicated logic!  
export class Pot {
	#prize
	#allInLimit

	// The amount needed to be bet, as per players.chipsBet. Needed, so that calling multiple times does not overcharge you.
	// More literally, it is simply matching the highest player.chipsbet, as players should bet towards it, or make it higher.
	#currentBet
	#players
	#sidePot = {}

	constructor(players, currentBet = 10) {
		this.#currentBet = currentBet
		this.#prize = 0

		this.#players = players.slice().sort((a,b) => (a.chipsRemaining + a.chipsBet) - (b.chipsRemaining + b.chipsBet))
		this.#allInLimit = this.#players[0].chipsRemaining + this.#players[0].chipsBet // The player with the least chips.

		// Maybe hacky? But making the function call just jump here if the pot isn't initialized is more efficient than having to check.
		// My argument why this is acceptable design-wise is it's purely recursive & internal: no one should jump here but this class.
		// It's also kind of cool, right? lol
		this.#sidePot.bet = (player, bet) => {
			for (var i = 0; i < this.#players.length; i++) {
				// As players is sorted lowest to highest we nab first highest
				if (this.#players[i].chipsRemaining + this.#players[i].chipsBet > this.#allInLimit) {
					var sidePot = new Pot(this.#players.slice(i), bet)
					this.#sidePot = sidePot
					return sidePot.bet(player, bet)
				}
			}
			// No reason to make a sidePot if it isn't actually aside from the rest.
			throw RangeError(`sidePot attempted to be created with ${bet+this.#currentBet} that isn't a larger then ${this.#allInLimit}`)
		}

		// If the sidePot was never initialized and these redefined, then they definitely do not do anything
		this.#sidePot.splitPot = () => {return}
		this.#sidePot.reward = (players) => {return}
		this.#sidePot.destroy = () => {return}
	}


	bet(player, bet = this.#currentBet) {
		if (bet < 0) {throw RangeError(`${player} is betting ${bet}. They're betting negative; they're stealing!!!`)}
		var betLimit = this.#allInLimit - player.chipsBet

		if (betLimit < 0) { // If we have bet enough that we cannot for this pot anymore
			this.#sidePot.bet(player, bet) // Then bet what we could for the next pot with higher stakes!
		}
		
		else if (bet > betLimit) { // If we will now bet more than we can for the Pot
			this.#prize += betLimit // We bet what we have left,
			player.chipsBet += betLimit
			player.chipsRemaining -= betLimit

			this.#sidePot.bet(player, bet - betLimit) // Then give to the next pot what we have left.
		}
		
		else { // Normal
			this.#prize += bet
			player.chipsBet += bet
			player.chipsRemaining -= bet
		}

		if (this.#currentBet < player.chipsBet) {this.#currentBet = player.chipsBet}
	}

	raise(player, raise) {
		if (raise > player.chipsRemaining) {
			this.bet(player, player.chipsRemaining)
		} else {
			this.bet(player, raise + this.#currentBet - player.chipsBet)
		}
	}

	// To call is to bet only up to that which is the currentBet.
	call(player) {
		let callBet = this.#currentBet - player.chipsBet

		if (callBet < 0) {
			this.bet(player, 0)
		} else if (callBet > player.chipsRemaining) {
			this.bet(player, player.chipsRemaining)
		} else {
			this.bet(player, callBet)
		}
	}


	splitPot() {
		let unFolded = this.#players.filter(player => player.state != "folded")
		unFolded.forEach(player => {
			player.chipsRemaining += (this.#prize/unFolded.length)
		})
		this.#prize = 0
		this.#sidePot.splitPot()
	}


	reward(players) {
		// What rewarded players could have been in this pot
		var playersInPot = players.filter(player => (player.chipsRemaining + player.chipsBet) >= this.#allInLimit)
		if (playersInPot.length > 0) { // If we have any,
			// Also reward them the next pot if they were in it
			this.#sidePot.reward(playersInPot)

			playersInPot.forEach(player => {
				player.chipsRemaining += (this.#prize/playersInPot.length)
			})

			this.#prize = 0
		} else {
			// Otherwise, split it between all players who could have been in this pot
			// Note that this indeed somewhat unintuitively does not care about which of the pot are the largest winners;
			// It actually never is in any game I know of! If a sidePot's betters don't win, their game just dissolves.
			this.splitPot()
		}
		return
	}


	// Destroy method to potentially help JavaScripts garbage collector.
	// Important, since sidePot recursion could get out of control.
	destroy() {
		this.#sidePot.destroy()

		this.#sidePot = null
		this.#prize = null
		this.#allInLimit = null
		this.#currentBet = null
		this.#players = null
	}
}




// If you want a reference, I recommend: https://www.youtube.com/watch?v=DUzoLS4tnUM
export class TexasHoldEm extends Poker {
	communityCards

	// Note that TexasHoldEm by definition needs betting. Otherwise, it is just "who draws the better hand."
	#pot
	#players
	#currentBet
	#toPlayIndex
	#firstToPlayIndex = 0 // Index of the first player in a betting round.
	#raised = false // AKA, if everyone hasn't called or folded, and so if a betting round is over we need to go again.
	#round = 0 // 0 = flop, 1 = turn, 2 = river, 3 = game over!

	constructor (
		/* 	Assumes an array of objects with:
			.chipsRemaining, which is a mutable value of chips to lose or grow larger through bets
			.chipsBet, which is a mutable value of chips that they have dedicated in the current game
			and a .send() function, equivalent to a NetworkingAPI.sendObject() but passed with the ID for the player

			.send() is of particular importance, as the caller of this needs its own .send() to get objects without networking,
			This is since certain .send() calls tell everyone what to render, and that includes the user of this object!
			It is also notable in that it handles all game state interfacing. 
			If you have AI, you'll likely have a player with a unique .send()

			Each will eventually be assigned a .state variable, either "none" "called" "folded" or "raised"
			And a .hand variable.

			Therefore, make this array per construction of texasHoldEm. It is transitory in design.
		*/
		players, 
		currentBet = 10,
	) {
		super(2)

		this.communityCards = []

		this.#players = players
		this.#currentBet = currentBet
		this.#pot = new Pot(this.#players, currentBet)
	}

	
	#sendToAllPlayers(object) {
		this.#players.forEach(player => {
			player.send(object)
		});
	}

	receiveAction(actionObject) {
		switch(actionObject.action) {
			case "raise":
				this.playerRaise(actionObject.playerIndex, actionObject.raise)
				break
			case "call":
				this.playerCall(actionObject.playerIndex)
				break
			case "fold":
				this.playerFold(actionObject.playerIndex)
				break
		}
	}


	getGameState() {
		return {
			type: "texasHoldEm",
			action: "gameState",
			currentBet: this.#currentBet,
			players: this.#players,
			toPlay: this.#toPlayIndex,
			communityCards: this.communityCards
		}
	}

	cardReveals() {
		for (let i = 0; i < this.#players.length; i++) {
			this.#sendToAllPlayers({
				type: "texasHoldEm",
				action: "showHand",
				ownerIndex: i,
				player: this.#players[i],
				handType: pokerHandType([...this.#players[i].hand, ...this.communityCards])
			})
		}
	}

	endGame() {
		var winners = []
		winners[0]= {hand: false}

		for (let i = 0; i < this.#players.length; i++) {
			if (this.#players[i].state == "folded") {continue}
			if (!winners[0].hand) {winners[0] = this.#players[i]; continue}

			let fullHand = [...this.#players[i].hand, ...this.communityCards]
			let lastFullhand = [...winners[0].hand, ...this.communityCards]

			if (pokerHandValueTable[pokerHandType(fullHand)] > pokerHandValueTable[pokerHandType(lastFullhand)]) {
				winners = []
				winners[0] = this.#players[i]
			}

			else if (pokerHandValueTable[pokerHandType(fullHand)] == pokerHandValueTable[pokerHandType(lastFullhand)]) {
				if (handScore(fullHand) > handScore(lastFullhand)) {
					winners = []
					winners[0] = this.#players[i]
				} else if (handScore(fullHand) == handScore(lastFullhand)) {
					winners.push(this.#players[i])
				}
			}
		}
		this.#pot.reward(winners)

		this.cardReveals()

		this.#sendToAllPlayers({
			type: "texasHoldEm",
			action: "revealedWinners",
			winners: winners
		})
	}

	ante(smallBlindIndex, bet = this.#currentBet/2) {
		this.#pot.bet(this.#players[smallBlindIndex], bet)

		// big blind
		this.#pot.bet(smallBlindIndex == this.#players.length-1 ? this.#players[0] : this.#players[smallBlindIndex + 1], bet*2)
		
		// Person next to the big blind, who will be the person to start playing in the game
		this.#firstToPlayIndex = (smallBlindIndex == this.#players.length-2 ? 0 : smallBlindIndex+2 % this.#players.length)
		this.#toPlayIndex = this.#firstToPlayIndex


		// Ante is also the start of the game, so we give everyone their hands.
		var hands = []
		this.deal(this.#players.length, hands)

		// Give everyone their hands
		for (let i = 0; i < this.#players.length; i++) {
			this.#players[i].hand = hands[i]

			// and tell them they have gotten a hand
			this.#players[i].send({
				type: "texasHoldEm",
				action: "giveHand",
				hand: [
					{
						label: this.#players[i].hand[0].label,
						suit: this.#players[i].hand[0].suit
					}, {
						label: this.#players[i].hand[1].label,
						suit: this.#players[i].hand[1].suit
					},
				]
			})
		}

		this.#sendToAllPlayers(this.getGameState())
	}

	#flop() {
		this.communityCards.push(this.cards.pop())
		this.communityCards.push(this.cards.pop())
		this.communityCards.push(this.cards.pop())

		this.#sendToAllPlayers({
			type: "texasHoldEm",
			action: "flop",
			flopped: [
				{
					label: this.communityCards[0].label,
					suit: this.communityCards[0].suit
				}, {
					label: this.communityCards[1].label,
					suit: this.communityCards[1].suit
				}, {
					label: this.communityCards[2].label,
					suit: this.communityCards[2].suit
				}
			]
		})
	}

	#turn() {
		this.communityCards.push(this.cards.pop())

		this.#sendToAllPlayers({
			type: "texasHoldEm",
			action: "turn",
			card: {
				label: this.communityCards[3].label,
				suit: this.communityCards[3].suit
			}
		})
	}

	#river() {
		this.communityCards.push(this.cards.pop())

		this.#sendToAllPlayers({
			type: "texasHoldEm",
			action: "river",
			card: {
				label: this.communityCards[4].label,
				suit: this.communityCards[4].suit
			}
		})
	}
	
	#nextTurn() {
		do {
			if (this.#toPlayIndex == this.#players.length-1) {
				this.#toPlayIndex = 0
			} else {
				this.#toPlayIndex = this.#toPlayIndex + 1
			}

			if (this.#toPlayIndex == this.#firstToPlayIndex) { // If we've reached the end, make it the next round.
				for (var i = 0; i < this.#players.length; i++) {
					if (this.#players[i].state != "folded") {
						this.#players[i].state = "none"

						this.#sendToAllPlayers(this.getGameState())
					}
				}

				if (!this.#raised) { // If we hadn't raised and have a new round of betting, we move onto the next game state
					switch (this.#round) {
						case 0:
							this.#flop()
							this.#round = 1
							break
						case 1:
							this.#turn()
							this.#round = 2
							break
						case 2:
							this.#river()
							this.#round = 3
							break
						case 3:
							this.endGame()
							break
					}
				} else {this.#raised = false} // Otherwise, we'll get 'em next round.
			}

			// If the player who would play has folded, they do not have a turn, so it must be the next persons!
		} while (this.#players[this.#toPlayIndex].state == "folded")

		// Tell everyone whose turn it is!
		this.#sendToAllPlayers({
			type: "texasHoldEm",
			action: "nextTurn",
			toPlay: this.#toPlayIndex
		})
	}


	playerRaise(playerIndex, raise) {
		if (playerIndex == this.#toPlayIndex) {
			var player = this.#players[playerIndex]
			if (player.state != "folded") {
				this.#pot.raise(player, raise)
				player.state = "raised"
				this.#raised = true
				
				this.#sendToAllPlayers({
					type: "texasHoldEm",
					action: "playerRaised",
					raiseAmount: raise,
					playerIndex: playerIndex,
					player: this.#players[playerIndex]
				})

				this.#nextTurn()
			}
		}
	}

	playerCall(playerIndex) { 
		if (playerIndex == this.#toPlayIndex) {
			var player = this.#players[playerIndex]
			if (player.state != "folded") {
				this.#pot.call(player)
				player.state = "called"


				this.#sendToAllPlayers({
					type: "texasHoldEm",
					action: "playerCalled",
					playerIndex: playerIndex,
					player: this.#players[playerIndex]
				})

				this.#nextTurn()
			}
		}
	}

	playerFold(playerIndex) {
		if (playerIndex == this.#toPlayIndex) {
			this.#players[playerIndex].state = "folded"

			this.#sendToAllPlayers({
				type: "texasHoldEm",
				action: "playerFolded",
				playerIndex: playerIndex,
				player: this.#players[playerIndex]
			})

			this.#nextTurn()
		}
	}
}


// Note that tableau is the community cards; I just used it as the name since it is more generic.
const texasHoldEmHTML = `
<label for="texasHoldEmRaiseInput">raise input:</label>
<input class="raiseInput" id="texasHoldEmRaiseInput"></input>
<button class="raise" id="texasHoldEmRaise"></button>
<button class="call" id="texasHoldEmCall"></button>
<button class="fold" id="texasHoldEmFold"></button>
<ul class="hand" id="texasHoldemHand"></ul>
<ul class="tableau" id="texasHoldemTableau"></ul>
<ul class="playerStates" id="texasHoldemPlayerStates"></ul>
<div class="gameOutput" id="texasHoldemOutput"></div>
`



export class TexasHoldEmHTMLHandler {
	// Arbitrarily accessible class attributes for easy access to DOM elements.
	currentBet
	raiseInput
	raise
	call
	fold
	hand
	tableau
	gameOutput // Usage of gameOutput should be liberally changed into wiser bits of UI. For now though, its a nice placeholder.

	playerStates
	playerSelfIndex

	sendToHost

	constructor(document, container, 
		players,
		playerSelfIndex, // The index for the player representing the creator of this HTMLHandler.

		// A NetworkAPI.sendObject function directed to the host of the game, for game actions.
		// If you are the host, this must instead be a function that passes to the game itself: texasHoldEm.receiveAction(action)
		sendToHost
	) {
		container.insertAdjacentHTML("beforeend", texasHoldEmHTML)

		this.playerSelfIndex = playerSelfIndex
		this.sendToHost = sendToHost

		this.document = document
		this.raiseInput = document.getElementById("texasHoldEmRaiseInput")
		// need a "current pot" element here, likely.
		this.raise = document.getElementById("texasHoldEmRaise")

		// As a note on calling, it is to effectively be the same thing as checking / staying
		// This is since you only check if no one has made a bet yet, and in such a case, you actually are just calling for 0 chips.
		this.call = document.getElementById("texasHoldEmCall")
		this.fold = document.getElementById("texasHoldEmFold")
		this.hand = document.getElementById("texasHoldemHand")
		this.tableau = document.getElementById("texasHoldemTableau")
		this.playerStates = document.getElementById("texasHoldemPlayerStates")
		this.gameOutput = document.getElementById("texasHoldemOutput")

		for (var i = 0; i < players.length; i++) {
			const player = this.document.createElement("li")
			player.classList.add("player")
			player.dataset.state = "none"
			player.dataset.name = players[i].name
			player.dataset.index = i
			player.dataset.chipsRemaining = players[i].chipsRemaining
			player.dataset.chipsBet = players[i].chipsBet

			this.playerStates.appendChild(player)
		}


		this.call.onclick = () => {
			this.sendToHost({
				type: "texasHoldEm",
				action: "call",
				playerIndex: playerSelfIndex
			})
		}

		this.raise.onclick = () => {
			this.sendToHost({
				type: "texasHoldEm",
				action: "raise",
				playerIndex: playerSelfIndex,
				raise: Number(this.raiseInput.value)
			})
		}

		this.fold.onclick = () => {
			this.sendToHost({
				type: "texasHoldEm",
				action: "fold",
				playerIndex: playerSelfIndex
			})
		}
	}

	outputString(string) {
		const newOutput = document.createElement("p")
		newOutput.innerHTML = string
		this.output.appendChild(newOutput)
	}

	updatePlayerState(playerIndex, state) {
		const playerStates = this.playerStates.querySelectorAll(`[data-index="${playerIndex}"`)
		playerStates.forEach(playerState => {
			playerState.dataset.state = state // as in folded, called, or raised
		})
	}

	updatePlayerBalance(playerIndex, chipsBet, chipsRemaining) {
		const playerStates = this.playerStates.querySelectorAll(`[data-index="${playerIndex}"`)
		playerStates.forEach(playerState => {
			playerState.dataset.chipsBet = chipsBet
			playerState.dataset.chipsRemaining = chipsRemaining
		})
	}


	renderHand(hand) {
		for (let i = 0; i < hand.length; i++) {
			const card = this.document.createElement("li")
			card.classList.add("card")
			card.dataset.label = hand[i].label
			card.dataset.suit = hand[i].suit
			card.dataset.index = i

			this.hand.appendChild(card)
		}
	}

	// Essentially, we want the NetworkAPI to give any texasHoldEm actions to the HTMLHandler, so we can handle them.
	// We expect that NetworkAPI to send a JavaScript object converted from a sent JSON message.

	// A lot of these are frankly really stupid, and should be consolidated.
	// For one, most actions dedicated to rendering are pretty much just be some variation of the "gameState" action 
	receiveAction(actionObject) {
		switch(actionObject.action) {
			case "giveHand":
				this.renderHand(actionObject.hand)
				break

			case "nextTurn": 
				if (actionObject.toPlay == this.playerSelfIndex) {
					const p = this.document.createElement("p")
					p.innerText = "It is your turn to play!"
					this.gameOutput.appendChild(p)
				} else {
					const p = this.document.createElement("p")
					p.innerText = "It is player " + actionObject.toPlay + "'s turn."
					this.gameOutput.appendChild(p)
				}
				break

			case "flop":
				for (let i = 0; i < actionObject.flopped.length; i++) {
					const card = this.document.createElement("li")
					card.classList.add("card")
					card.dataset.label = actionObject.flopped[i].label
					card.dataset.suit = actionObject.flopped[i].suit
					card.dataset.index = i

					this.tableau.appendChild(card)
				}
				break

			case "turn": {
				const card = this.document.createElement("li")
				card.classList.add("card")
				card.dataset.label = actionObject.card.label
				card.dataset.suit = actionObject.card.suit
				card.dataset.index = 3
				this.tableau.appendChild(card) 
			} break

			case "river": {
				const card = this.document.createElement("li")
				card.classList.add("card")
				card.dataset.label = actionObject.card.label
				card.dataset.suit = actionObject.card.suit
				card.dataset.index = 4
				this.tableau.appendChild(card)
			} break

			case "revealedWinners": {
				actionObject.winners.forEach(winner => {
					const p = this.document.createElement("p")
					p.innerText = p.innerText + winner.name + " won!\n"
					this.gameOutput.appendChild(p)
				})
			} break

			case "showHand": {
				const p = this.document.createElement("p")
				p.innerText = actionObject.player.name + " had " + actionObject.player.hand[0].label + " " + actionObject.player.hand[0].suit
				+ " and " + actionObject.player.hand[1].label + " " + actionObject.player.hand[1].suit + ". A " + actionObject.handType

				this.gameOutput.appendChild(p)
				this.updatePlayerBalance(actionObject.ownerIndex, actionObject.player.chipsBet, actionObject.player.chipsRemaining)
			} break

			case "playerRaised": {
				const p = this.document.createElement("p")
				p.innerText = "Player " + actionObject.playerIndex + " raised " + actionObject.raiseAmount
				this.gameOutput.appendChild(p)
				
				this.updatePlayerState(actionObject.playerIndex, "raised")
				this.updatePlayerBalance(actionObject.playerIndex, actionObject.player.chipsBet, actionObject.player.chipsRemaining)
			} break

			case "playerCalled": {
				const p = this.document.createElement("p")
				p.innerText = "Player " + actionObject.playerIndex + " called."
				this.gameOutput.appendChild(p)
				
				this.updatePlayerState(actionObject.playerIndex, "called")
				this.updatePlayerBalance(actionObject.playerIndex, actionObject.player.chipsBet, actionObject.player.chipsRemaining)
			} break

			case "playerFolded": {
				const p = this.document.createElement("p")
				p.innerText = "Player " + actionObject.playerIndex + " called."
				this.gameOutput.appendChild(p)
				
				this.updatePlayerState(actionObject.playerIndex, "folded")
			} break

			case "gameState": {
				for (let i = 0; i < actionObject.players.length; i++) {
					this.updatePlayerState(i, actionObject.players[i].state)
					this.updatePlayerBalance(i, actionObject.players[i].chipsBet, actionObject.players[i].chipsRemaining)
				}
			} break

			// Kind of stupid, but I like the logic.
			// The host has sendToHost() send this to the host stuff, whilst others have sendToHost() send it to the host.
			case "raise":
			case "call":
			case "fold":
				this.sendToHost(actionObject)
				break
		}
	}
}



// RoyalHoldEm is TexasHoldEm, but with only tens, jacks, queens, kings, and aces.
// Source: https://en.wikipedia.org/wiki/Community_card_poker#Royal_hold_'em
export class RoyalHoldEm extends TexasHoldEm {
	constructor() {
		super()
		this.cards = [this.AS, this.TenS, this.JS, this.QS, this.KS, this.AH, this.TenH, this.JH, this.QH, this.KH, this.AC, this.TenC, this.JC, this.QC, this.KC, this.AD, this.TenD, this.JD, this.QD, this.KD];
	}

	reset() {
		this.cards = [this.AS, this.TenS, this.JS, this.QS, this.KS, this.AH, this.TenH, this.JH, this.QH, this.KH, this.AC, this.TenC, this.JC, this.QC, this.KC, this.AD, this.TenD, this.JD, this.QD, this.KD];
	}
}
 


export class Player {
	chipsRemaining = 0
	chipsBet = 0
	state = "none"
	name = "anonymous"
	
	constructor(sendFunction) {
		this.send = sendFunction
	}
}




// Decent reference here: https://en.wikipedia.org/wiki/Five-card_draw
// Note I have chosen to not have limits on how many cards you can discard at a time. That is to my knowledge a house rule.
// It's pretty much just VideoPoker, but with two betting rounds; one after the first draw, one after the discard.
export class FiveCardDraw extends Poker {
	#pot
	#players
	#currentBet
	#toPlayIndex
	#firstToPlayIndex = 0 // Index of the first player in a betting round.
	#raised = false // AKA, if everyone hasn't called or folded, and so if a betting round is over we need to go again.
	#round = 0 // 0 = discard, 1 = final betting round, 2 = game over!

	// Like texas hold em, assumes a players array with .chipsRemaining, .chipsBet, .send(), and .state
	// We will also give them a .hand at their leisure.
	// .state has an extra state this time, which is "discarded" for the discard round.
	// Thus, like texas hold em, also make this class and the players array per game. We're gonna mess 'em up!
	constructor (players, currentBet = 10) {
		super(5)

		this.#players = players
		this.#currentBet = currentBet
		this.#pot = new Pot(this.#players, currentBet)
	}

	#sendToAllPlayers(object) {
		this.#players.forEach(player => {
			player.send(object)
		});
	}

	receiveAction(actionObject) {
		switch(actionObject.action) {
			case "discard":
				this.playerDiscard(actionObject.playerIndex, cardsToDiscard)
			case "raise":
				this.playerRaise(actionObject.playerIndex, actionObject.raise)
				break
			case "call":
				this.playerCall(actionObject.playerIndex)
				break
			case "fold":
				this.playerFold(actionObject.playerIndex)
				break
		}
	}

	getGameState() {
		return {
			type: "fiveCardDraw",
			action: "gameState",
			currentBet: this.#currentBet,
			players: this.#players,
			toPlay: this.#toPlayIndex,
			communityCards: this.communityCards
		}
	}



	cardReveals() {
		for (let i = 0; i < this.#players.length; i++) {
			this.#sendToAllPlayers({
				type: "fiveCardDraw",
				action: "showHand",
				ownerIndex: i,
				player: this.#players[i],
				handType: pokerHandType([...this.#players[i].hand, ...this.communityCards])
			})
		}
	}

	endGame() {
		var winners = []
		winners[0]= {hand: false}

		for (let i = 0; i < this.#players.length; i++) {
			if (this.#players[i].state == "folded") {continue}
			if (!winners[0].hand) {winners[0] = this.#players[i]; continue}

			let fullHand = [...this.#players[i].hand]
			let lastFullhand = [...winners[0].hand]

			if (pokerHandValueTable[pokerHandType(fullHand)] > pokerHandValueTable[pokerHandType(lastFullhand)]) {
				winners = []
				winners[0] = this.#players[i]
			}

			else if (pokerHandValueTable[pokerHandType(fullHand)] == pokerHandValueTable[pokerHandType(lastFullhand)]) {
				if (handScore(fullHand) > handScore(lastFullhand)) {
					winners = []
					winners[0] = this.#players[i]
				} else if (handScore(fullHand) == handScore(lastFullhand)) {
					winners.push(this.#players[i])
				}
			}
		}
		this.#pot.reward(winners)

		this.cardReveals()

		this.#sendToAllPlayers({
			type: "fiveCardDraw",
			action: "revealedWinners",
			winners: winners
		})
	}

	ante(smallBlindIndex, bet = this.#currentBet/2) {
		this.#pot.bet(this.#players[smallBlindIndex], bet)

		// big blind
		this.#pot.bet(smallBlindIndex == this.#players.length-1 ? this.#players[0] : this.#players[smallBlindIndex + 1], bet*2)
		
		// Person next to the big blind, who will be the person to start playing in the game
		this.#firstToPlayIndex = (smallBlindIndex == this.#players.length-2 ? 0 : smallBlindIndex+2 % this.#players.length)
		this.#toPlayIndex = this.#firstToPlayIndex


		// Ante is also the start of the game, so we give everyone their hands.
		var hands = []
		this.deal(this.#players.length, hands)

		// Give everyone their hands
		for (let i = 0; i < this.#players.length; i++) {
			this.#players[i].hand = hands[i]

			// and tell them they have gotten a hand
			this.#players[i].send({
				type: "fiveCardDraw",
				action: "giveHand",
				hand: [
					{
						label: this.#players[i].hand[0].label,
						suit: this.#players[i].hand[0].suit
					}, {
						label: this.#players[i].hand[1].label,
						suit: this.#players[i].hand[1].suit
					}, {
						label: this.#players[i].hand[2].label,
						suit: this.#players[i].hand[2].suit
					}, {
						label: this.#players[i].hand[3].label,
						suit: this.#players[i].hand[3].suit
					}, {
						label: this.#players[i].hand[4].label,
						suit: this.#players[i].hand[4].suit
					},
				]
			})
		}

		this.#sendToAllPlayers(this.getGameState())
	}

	#nextTurn() {
		if (this.#round === 1) {return}
		do {
			if (this.#toPlayIndex == this.#players.length-1) {
				this.#toPlayIndex = 0
			} else {
				this.#toPlayIndex = this.#toPlayIndex + 1
			}

			if (this.#toPlayIndex == this.#firstToPlayIndex) { // If we've reached the end, make it the next round.
				for (var i = 0; i < this.#players.length; i++) {
					if (this.#players[i].state != "folded") {
						this.#players[i].state = "none"

						this.#sendToAllPlayers(this.getGameState())
					}
				}

				if (!this.#raised) { // If we hadn't raised and have a new round of betting, we move onto the next game state
					switch (this.#round) {
						case 0:
							this.#round = 1 // Time for discarding. 
							// A special occasion, so we just leave now
							this.#sendToAllPlayers({
								type: "fiveCardDraw",
								action: "discardTurn"
							})
							return
						case 2:
							this.endGame()
							break
						case 1: // If we're discarding, we shouldn't be here!!!
							throw Error("FiveCardDraw made discarding turn based")
						default:
							throw Error("Invalid fiveCardDraw round")
							return
					}
				} else {this.#raised = false} // Otherwise, we'll get 'em next round.
			}

			// If the player who would play has folded, they do not have a turn, so it must be the next persons!
		} while (this.#players[this.#toPlayIndex].state == "folded")

		// Tell everyone whose turn it is!
		this.#sendToAllPlayers({
			type: "fiveCardDraw",
			action: "nextTurn",
			toPlay: this.#toPlayIndex
		})
	}

	playerDiscard(playerIndex, cardsToDiscard) {
		// We do not care about turns when discarding. We just wait until everyone has discarded
		if (players[playerIndex].state != "discarded" && players[playerIndex].state != "folded" && this.round == 1) {
			for (const index of cardsToDiscard) {
				this.#players[playerIndex].hand[index] = this.cards.pop()
			}

			players[playerIndex].state = "discarded"

			this.#players[i].send({
				type: "fiveCardDraw",
				action: "giveHand",
				hand: [
					{
						label: this.#players[i].hand[0].label,
						suit: this.#players[i].hand[0].suit
					}, {
						label: this.#players[i].hand[1].label,
						suit: this.#players[i].hand[1].suit
					}, {
						label: this.#players[i].hand[2].label,
						suit: this.#players[i].hand[2].suit
					}, {
						label: this.#players[i].hand[3].label,
						suit: this.#players[i].hand[3].suit
					}, {
						label: this.#players[i].hand[4].label,
						suit: this.#players[i].hand[4].suit
					},
				]
			})

			this.#sendToAllPlayers({
				type: "fiveCardDraw",
				action: "playerDiscarded",
				discardAmount: cardsToDiscard.length,
				playerIndex: playerIndex,
				player: this.#players[playerIndex]
			})


			for (player of this.#players) {
				if (player.state != "folded" || player.state != "discarded") {
					return
				}
			}
			// If that for loop did not exit, then everyone has either discarded or folded. Thus, its onto the next turn!
			this.#round = 2
			this.#nextTurn()
		}
	}

	playerRaise(playerIndex, raise) {
		if (playerIndex == this.#toPlayIndex) {
			var player = this.#players[playerIndex]
			if (player.state != "folded") {
				this.#pot.raise(player, raise)
				player.state = "raised"
				this.#raised = true

				this.#sendToAllPlayers({
					type: "fiveCardDraw",
					action: "playerRaised",
					raiseAmount: raise,
					playerIndex: playerIndex,
					player: this.#players[playerIndex]
				})

				this.#nextTurn()
			}
		}
	}

	playerCall(playerIndex) { 
		if (playerIndex == this.#toPlayIndex) {
			var player = this.#players[playerIndex]
			if (player.state != "folded") {
				this.#pot.call(player)
				player.state = "called"


				this.#sendToAllPlayers({
					type: "fiveCardDraw",
					action: "playerCalled",
					playerIndex: playerIndex,
					player: this.#players[playerIndex]
				})

				this.#nextTurn()
			}
		}
	}

	playerFold(playerIndex) {
		if (playerIndex == this.#toPlayIndex) {
			this.#players[playerIndex].state = "folded"

			this.#sendToAllPlayers({
				type: "fiveCardDraw",
				action: "playerFolded",
				playerIndex: playerIndex,
				player: this.#players[playerIndex]
			})

			this.#nextTurn()
		}
	}
}


// This is the same as videoPokerHTML, but with betting added
const fiveCardDrawHTML = `
<span class="currentChips" id="fiveCardDrawCurrentChips"></span>
<button class="discardButton" id="fiveCardDrawDiscardButton"></button>
<label for="fiveCardDrawRaiseInput">raise input:</label>
<input class="raiseInput" id="fiveCardDrawRaiseInput"></input>
<button class="raise" id="fiveCardDrawRaise"></button>
<button class="call" id="fiveCardDrawCall"></button>
<button class="fold" id="fiveCardDrawFold"></button>
<ul class="hand" id="fiveCardDrawHand"></ul>
<ul class="playerStates" id="fiveCardDrawPlayerStates"></ul>
<div class="gameOutput" id="fiveCardDrawOutput"></div>
`

// Works much like texasHoldEmHTMLHandler, as it handles multiplayer bets and the like.
export class FiveCardDrawHTMLHandler {
	// Arbitrarily accessible class attributes for easy access to DOM elements.
	currentChips
	discardButton
	raiseInput
	raise
	call
	fold
	hand
	gameOutput

	playerStates
	playerIndex
	
	sendToHost

	constructor(document, container, players,
		playerSelfIndex, // The index for the player representing the creator of this HTMLHandler.

		// A NetworkAPI.sendObject function directed to the host of the game, for game actions.
		// If you are the host, this must instead be a function that passes to the game itself: fiveCardDraw.receiveAction(action)
		sendToHost
	) {
		container.insertAdjacentHTML("beforeend", fiveCardDrawHTML)

		this.document = document
		this.currentChips = document.getElementById("fiveCardDrawCurrentChips")
		this.betInput = document.getElementById("fiveCardDrawRaiseInput")
		this.discardButton = document.getElementById("fiveCardDrawDiscardButton")
		this.raiseInput = document.getElementById("fiveCardDrawRaiseInput")
		this.raise = document.getElementById("fiveCardDrawRaise")
		this.call = document.getElementById("fiveCardDrawCall")
		this.fold = document.getElementById("fiveCardDrawFold")
		this.hand = document.getElementById("fiveCardDrawHand")
		this.playerStates = document.getElementById("fiveCardDrawPlayerStates")
		this.gameOutput = document.getElementById("fiveCardDrawOutput")

		for (var i = 0; i < players.length; i++) {
			const player = this.document.createElement("li")
			player.classList.add("player")
			player.dataset.state = "none"
			player.dataset.name = players[i].name
			player.dataset.index = i
			player.dataset.chipsRemaining = players[i].chipsRemaining
			player.dataset.chipsBet = players[i].chipsBet

			this.playerStates.appendChild(player)
		}


		// The deal button is called only when it is time to discard cards after the first betting round
		this.discardButton.onclick = () => {
			const cards = this.hand.querySelectorAll("li")
			let cardsToDiscard = []
			for (card of cards) { // Find all cards we selected to discard
				if (card.dataset.selected = "TRUE") {
					cardsToDiscard.push(card.dataset.index)
				}
			}

			this.sendToHost({
				type: "fiveCardDraw",
				action: "discard",
				cardsToDiscard: cardsToDiscard,
				playerIndex: playerSelfIndex
			})
		}

		this.call.onclick = () => {
			this.sendToHost({
				type: "fiveCardDraw",
				action: "call",
				playerIndex: playerSelfIndex
			})
		}

		this.raise.onclick = () => {
			this.sendToHost({
				type: "fiveCardDraw",
				action: "raise",
				playerIndex: playerSelfIndex,
				raise: Number(this.raiseInput.value)
			})
		}

		this.fold.onclick = () => {
			this.sendToHost({
				type: "fiveCardDraw",
				action: "fold",
				playerIndex: playerSelfIndex
			})
		}
	}


	outputString(string) {
		const newOutput = document.createElement("p")
		newOutput.innerHTML = string
		this.output.appendChild(newOutput)
	}


	renderHand(hand) {
		for (let i = 0; i < hand.length; i++) {
			const card = this.document.createElement("li")
			card.classList.add("card")
			card.dataset.label = hand[i].label
			card.dataset.suit = hand[i].suit
			card.dataset.index = i
			card.dataset.selected = "FALSE"

			card.addEventListener("click", () => {
				if (card.dataset.selected != "TRUE") {
					card.dataset.selected = "TRUE"
				} else {
					card.dataset.selected = "FALSE"
				}
			})
			
			this.hand.appendChild(card)
		}
	}


	updatePlayerState(playerIndex, state) {
		const playerStates = this.playerStates.querySelectorAll(`[data-index="${playerIndex}"`)
		playerStates.forEach(playerState => {
			playerState.dataset.state = state // as in folded, called, or raised
		})
	}

	updatePlayerBalance(playerIndex, chipsBet, chipsRemaining) {
		const playerStates = this.playerStates.querySelectorAll(`[data-index="${playerIndex}"`)
		playerStates.forEach(playerState => {
			playerState.dataset.chipsBet = chipsBet
			playerState.dataset.chipsRemaining = chipsRemaining
		})
	}


	receiveAction(actionObject) {
		switch(actionObject.action) {
			case "giveHand":
				this.renderHand(actionObject.hand)
				break

			case "nextTurn": 
				if (actionObject.toPlay == this.playerSelfIndex) {
					const p = this.document.createElement("p")
					p.innerText = "It is your turn to play!"
					this.gameOutput.appendChild(p)
				} else {
					const p = this.document.createElement("p")
					p.innerText = "It is player " + actionObject.toPlay + "'s turn."
					this.gameOutput.appendChild(p)
				}
				break

			case "showHand": {
				const p = this.document.createElement("p")
				p.innerText = actionObject.player.name + " had " + actionObject.player.hand[0].label + " " + actionObject.player.hand[0].suit
				+ " and " + actionObject.player.hand[1].label + " " + actionObject.player.hand[1].suit + ". A " + actionObject.handType

				this.gameOutput.appendChild(p)
				this.updatePlayerBalance(actionObject.ownerIndex, actionObject.player.chipsBet, actionObject.player.chipsRemaining)
			} break

			case "playerDiscarded": {
				const p = this.document.createElement("p")
				p.innerText = "Player " + actionObject.playerIndex + " discarded " + actionObject.discardAmount
				this.gameOutput.appendChild(p)
				
				this.updatePlayerState(actionObject.playerIndex, "discarded")
			} break

			case "playerRaised": {
				const p = this.document.createElement("p")
				p.innerText = "Player " + actionObject.playerIndex + " raised " + actionObject.raiseAmount
				this.gameOutput.appendChild(p)
				
				this.updatePlayerState(actionObject.playerIndex, "raised")
				this.updatePlayerBalance(actionObject.playerIndex, actionObject.player.chipsBet, actionObject.player.chipsRemaining)
			} break

			case "playerCalled": {
				const p = this.document.createElement("p")
				p.innerText = "Player " + actionObject.playerIndex + " called."
				this.gameOutput.appendChild(p)
				
				this.updatePlayerState(actionObject.playerIndex, "called")
				this.updatePlayerBalance(actionObject.playerIndex, actionObject.player.chipsBet, actionObject.player.chipsRemaining)
			} break

			case "playerFolded": {
				const p = this.document.createElement("p")
				p.innerText = "Player " + actionObject.playerIndex + " called."
				this.gameOutput.appendChild(p)
				
				this.updatePlayerState(actionObject.playerIndex, "folded")
			} break

			case "gameState": {
				for (let i = 0; i < actionObject.players.length; i++) {
					this.updatePlayerState(i, actionObject.players[i].state)
					this.updatePlayerBalance(i, actionObject.players[i].chipsBet, actionObject.players[i].chipsRemaining)
				}
			} break

			// Kind of stupid, but I like the logic.
			// The host has sendToHost() send this to the host stuff, whilst others have sendToHost() send it to the host.
			case "raise":
			case "call":
			case "fold":
			case "discard":
				this.sendToHost(actionObject)
				break
		}
	}
}
