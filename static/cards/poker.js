import {Deck} from "./deck.js"



// Would like to officially note this is poorly made! Refactoring it to make it fancy would be a cool stretch goal.
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



class VideoPoker extends Poker {
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
class Pot {
	#prize
	#allInLimit
	#minimumBet
	#players
	#sidePot

	constructor(players, minimumBet = 1) {
		this.#minimumBet = minimumBet
		this.#prize = 0

		this.#players = players.slice().sort((a,b) => (a.chipsRemaining + a.chipsBet) - (b.chipsRemaining + b.chipsBet))
		this.#allInLimit = this.#players[0].chipsRemaining + this.#players[0].chipsBet


		// Maybe hacky? But making the function call just jump here if the pot isn't initialized is more efficient than having to check.
		// My argument why this is acceptable design-wise is it's purely recursive & internal: no one should jump here but this class.
		// It's also kind of cool, right? lol
		this.#sidePot.bet = (player, bet) => {
			for (var i = 0; i < this.#players.length; i++) {
				if (this.#players[i].chipsRemaining + this.#players[i].chipsBet > this.#allInLimit) {
					var sidePot
					if (bet >= this.#minimumBet) {
						// This slice is fine as we shouldn't use the players array for anything but balance keeping.
						// After all, all that this class does is help keep balance of bets, rather than decide how they are to bet.
						sidePot = new Pot(this.#players.slice(i), bet)
					} else {
						// This is needed since a sidePot can be betted with "spill over" less then the currentBet.
						sidePot = new Pot(this.#players.slice(i), this.#minimumBet)
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
		this.#sidePot.reward = (player) => {return}
		this.#sidePot.destroy = () => {return}

	}


	bet(player, bet = this.#minimumBet) {
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
			// Questionable, but I believe it's up to the caller if they care if chipsRemaining is negative.
			// After all, what does the pot know about .chipsRemaining? That's logic for players; this is card game logic!
			player.chipsRemaining -= bet
			return
		}
	}

	raise(player, raise = this.#minimumBet) {
		let newBet = raise + this.#minimumBet
		this.bet(player, newBet)
		this.#minimumBet = newBet
	}

	call(player) {this.bet(player, this.#minimumBet)}


	splitPot() {
		this.#players.forEach(player => {
			player.chipsRemaining += (this.#prize/this.#players.length)
		})
		this.#prize = 0
		this.#sidePot.splitPot()
	}


	reward(player) {
		// If the player could have been in this pot
		if ((player.chipsRemaining + player.chipsBet) < this.#allInLimit) {
			this.#sidePot.reward(player) // Also reward them the next pot, if they were in it.
			player.chipsRemaining += this.#prize
			this.#prize = 0
		} else {
			// Otherwise, all players who could have been in this pot split the sharings
			this.#sidePot.splitPot()
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
		this.#minimumBet = null
		this.#players = null
	}
}


// If you want a reference, I recommend: https://www.youtube.com/watch?v=DUzoLS4tnUM
class TexasHoldEm extends Poker {
	communityCards

	// Note that TexasHoldEm by definition needs betting. Otherwise, it is just "who has the better hand."
	#pot
	#players
	#minimumBet

	constructor (
		/* 	Assumes an array of player objects with:
			.chipsRemaining, which is a mutable value of chips to lose or grow larger through bets
			.chipsBet, which is a mutable value of chips that they have dedicated in the current game
		*/
		players, 
		minimumBet = 1
	) {
		super(2)

		this.communityCards = []

		this.#players = players
		this.#minimumBet = minimumBet
		this.#pot = new Pot(this.#players, minimumBet)
	}


	ante(smallBlindIndex, bet = this.#minimumBet/2) {
		this.#pot.bet(this.#players[smallBlindIndex], bet)

		this.#pot.bet(smallBlindIndex === this.players.length ? this.#players[0] : this.players[bigBlindIndex + 1], bet*2)
	}

	bettingRound() {

	}

	#pushCommunityCard() {this.communityCards.push(this.cards.pop())}

	decideWinner() {

	}
}


// Note that tableau is the community cards; I just used it as the name since it is more generic.
const texasHoldEmHTML = `
<span class="currentChips" id="texasHoldEmCurrentChips"></span>
<span class="currentBet" id="texasHoldEmCurrentChips"></span>
<input class="raiseInput" id="texasHoldEmRaiseInput"></input>
<button class="raise" id="texasHoldEmRaise"></button>
<button class="call" id="texasHoldEmCall"></button>
<button class="fold" id="texasHoldEmFold"></button>
<ul class="hand" id="texasHoldemHand"></ul>
<ul class="tableau" id="texasHoldemTableau"></ul>
<ul class="playerStates" id="texasHoldemPlayerStates></ul>
<div class="gameOutput" id="texasHoldemOutput"></div>
`


export class TexasHoldEmHTMLHandler {
	// Arbitrarily accessible class attributes for easy access to DOM elements.
	currentChips
	currentBet
	raiseInput
	raise
	call
	fold
	hand
	tableau
	gameOutput
	playerStates

	#texasHoldEm
	#players

	constructor(document, container, 
		/* 	Assumes an array of player objects with:
			.chipsRemaining, which is a mutable value of chips to lose or grow larger through bets
			.chipsBet, which is a mutable value of chips that they have dedicated in the current game
		*/
		players,
	) {
		container.insertAdjacentHTML("beforeend", texasHoldEmHTML)

		this.#players = players
		this.#texasHoldEm = new TexasHoldEm()

		this.document = document
		this.currentChips = document.getElementById("texasHoldEmCurrentChips")
		this.currentBet = document.getElementById("texasHoldEmCurrentChips")
		this.raiseInput = document.getElementById("texasHoldEmRaiseInput")
		// need a "current pot" element here, likely.
		this.raise = document.getElementById("texasHoldEmRaise")
		this.call = document.getElementById("texasHoldEmCall")
		this.fold = document.getElementById("texasHoldEmFold")
		this.hand = document.getElementById("texasHoldemHand")
		this.tableau = document.getElementById("texasHoldemTableau")
		this.playerStates = document.getElementById("texasHoldemPlayerStates")
		this.gameOutput = document.getElementById("texasHoldemOutput")

		for (let i = 0; i < players.length; i++) {
			const player = this.document.createElement("li")
			player.classList.add("player")
			player.dataset.state = "none"
			player.dataset.index = i

			this.playerStates.appendChild(player)
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
			playerState.dataset.state = state // as in fold, call, or raise
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

	renderTableau(tableau) {
		for (let i = 0; i < tableau.length; i++) {
			const card = this.document.createElement("li")
			card.classList.add("card")
			card.dataset.label = tableau[i].label
			card.dataset.suit = tableau[i].suit
			card.dataset.index = i

			this.tableau.appendChild(card)
		}
	}

	
	/* 	A mess of a function over all, particularly notable due to its incompleteness.
		
		I believe it would be best that .#players and .#texasHoldEm are put into a seperate "host handler" class;
		Only the host should have the game logic, and we need raise-fold-call inputs from other players for this all to work.  
	*/
	async start(smallBlindIndex) {
		this.#texasHoldEm.ante(smallBlindIndex)

		var hands = []
		this.#texasHoldEm.deal(this.#players.length, hands)

		for (let i = 0; i < this.#players.length; i++) {
			// This is a make-believe pretend method of whatever players are. No clue how, but we give them a hand!
			this.#players[i].giveHand(hand[i])
		}

		// We are logically players[0] because we are the one calling the entire HTMLHandler in the first place. So we render our cards
		for (let i = 0; i < this.#players[0].hand.length; i++) {
			const card = this.document.createElement("li")
			card.classList.add("card")
			card.dataset.label = this.#players[0].hand[i].label
			card.dataset.suit = this.#players[0].hand[i].suit
			card.dataset.index = i

			this.hand.appendChild(card)
		}

		// And then, somehow, we need to get raise-fold-call from all other players to continue
		// Note that each time someone raises we have to re-do the entire thing until everyone has either called, is all-in, or folded.
		
		// Then we do the flop here (three comunnity card revealed)

		// another raise-fold-call
		
		// The turn (one community card revealed)

		// Another raise-fold-call

		// The river (Final community card revealed)

		// Raise-fold-call again
		
		// And then we check the poker hands to find our winner. 
	}
}