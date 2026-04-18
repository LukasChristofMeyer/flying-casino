import {Deck} from "./deck.js"



// Would like to officially note this function is poorly made! Refactoring it to make it fancy would be a cool stretch goal.
// Particularly, it'd be nice if we could return a struct showing exactly what cards made up a hand, like a pair.
// That would be especially nice considering that the winner of a draw is decided on the value of those cards.
function pokerHandType(hand) {
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
	var isFlush = true
	var lastCard = hand[0]
	
	hand.forEach(card => {
		labelCounts[card.label]++

		// Checks both for a hopeful minor efficiency gain, since checking it isn't a flush is quick and likely
		if (isFlush && lastCard.suit != card.suit) {isFlush = false}
		lastCard = card
	});

	var sortedCount = Object.entries(labelCounts).sort((a,b) => b[1] - a[1])

	// Couldn't be bothered to make a proper algorithm for checking poker hands right now.
	// The below does work though!

	// I also couldn't be bothered to deal with straights properly... Should not be horrendous as a switch statement, though?
	var isStraight = false
	switch (sortedCount[0][0]) {
		case "Ace": 
			isStraight = (sortedCount[4][1] == "Five" || sortedCount[4][1] == "Ten") 
			break
		case "Two": isStraight = (sortedCount [4][0] == "Six"); break;
		case "Three": isStraight = (sortedCount [4][0] == "Seven"); break;
		case "Four": isStraight = (sortedCount [4][0] == "Eight"); break;
		case "Five": isStraight = (sortedCount [4][0] == "Nine"); break;
		case "Six": isStraight = (sortedCount [4][0] == "Ten"); break;
		case "Seven": isStraight = (sortedCount [4][0] == "Jack"); break;
		case "Eight": isStraight = (sortedCount [4][0] == "Queen"); break;
		case "Nine": isStraight = (sortedCount [4][0] == "King"); break;
		default: break;
	}


	if (sortedCount[0][1] >= 5) {return "Five of a Kind"}
	if (isFlush && isStraight >= 1) {return "Straight Flush"}
	if (sortedCount[0][1] >= 4) {return "Four of a Kind"}
	if (sortedCount[0][1] >= 3 && sortedCount[1][1] >= 2) {return "Full House"}
	if (isFlush) {return "Flush"}
	if (isStraight) {return "Straight"}
	if (sortedCount[0][1] >= 3) {return "Three of a Kind"}
	if (sortedCount[0][1] >= 2 && sortedCount[1][1] >= 2) {return "Two Pair"}
	if (sortedCount[0][1] >= 2) {return "Pair"}
	return "High Card"
}

const pokerHandValueTable = {
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

function handScore(hand) {
	var score = 0;
	hand.forEach(card => {
		score = score + card.value
	});
	return score
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
//
// Note that this class is untested, and may need a lot of debugging.
class Pot {
	#prize
	#allInLimit
	#currentBet // The amount needed to be bet, as per players.chipsBet. Needed, so that calling multiple times does not overcharge you.
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
				if (this.#players[i].chipsRemaining + this.#players[i].chipsBet > this.#allInLimit) {
					var sidePot
					if (bet >= this.#currentBet) {
						// This slice is fine as we shouldn't use the players array for anything but balance keeping.
						// After all, all that this class does is help keep balance of bets, rather than decide how they are to bet.
						sidePot = new Pot(this.#players.slice(i), bet)
					} else {
						// This is needed since a sidePot can be betted with "spill over" less then the currentBet.
						sidePot = new Pot(this.#players.slice(i), this.#currentBet)
					}

					this.#sidePot = sidePot
					return sidePot.bet(player, bet)
				}
			}
			// No reason to make a sidePot if it isn't actually aside from the rest.
			throw RangeError("sidePot attempted to be created without a larger limit")
		}

		// If the sidePot was never initialized and these redefined, then they definitely do not do anything
		this.#sidePot.splitPot = () => {return}
		this.#sidePot.reward = (players) => {return}
		this.#sidePot.destroy = () => {return}

	}


	bet(player, bet = this.#currentBet) {
		var betLimit = this.#allInLimit - player.chipsBet
		if (betLimit <= 0) { // If we have bet enough that we cannot for this pot anymore
			this.#sidePot.bet(player, bet) // Then we can just bet for the next pot with higher stakes!
			return
		}
		
		else if (bet > betLimit) { // If we will now bet more than we can for the Pot
			this.#prize += betLimit // We bet what we have left,
			player.chipsBet += betLimit
			player.chipsRemaining -= betLimit

			this.#sidePot.bet(player, bet - betLimit) // Then give to the next pot what we have left.
			return
		}
		
		else { // Normal
			this.#prize += bet
			player.chipsBet += bet
			player.chipsRemaining -= bet

			return
		}
	}

	raise(player, raise) {
		let newBet = raise + this.#currentBet
		this.#currentBet = newBet
		this.call(player)
	}

	// To call is to bet only up to that which is the currentBet.
	call(player) {
		let callBet = this.#currentBet - player.chipsBet
		if (callBet < 0) {
			this.bet(player, 0)
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
		var playersInPot = players.filter(player => (player.chipsRemaining + player.chipsBet) < this.#allInLimit)
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
		this.#firstToPlayIndex = (smallBlindIndex == this.#players.length-2 ? 0 : smallBlindIndex+2)
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

				if (!this.#raised) { // If we hadn't raised and new a round of betting, we move onto the next game state
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

/*	to-do
	Differentiate between host and non-host
		Ensure that the host gives non-hosts a players list matching their own. (or otherwise make lists compatible)
	Test if everything actually works
*/
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



export class Player {
	chipsRemaining = 0
	chipsBet = 0
	state = "none"
	name = "anonymous"
	
	constructor(sendFunction) {
		this.send = sendFunction
	}
}