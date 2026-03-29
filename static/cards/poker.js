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

	constructor(document, container, 
		// This likely shouldn't be exposed to the caller, but with website stuff right now that isn't certain, so I've made it flexible.
		html = videoPokerHTML) 
	{
		container.insertAdjacentHTML("beforeend", html)

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
		
		for (var i = 0; i < this.videoPoker.hand.length; i++) {
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