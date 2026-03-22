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

export class VideoPoker extends Poker {
	constructor() {
		super(5)
	}

	
}