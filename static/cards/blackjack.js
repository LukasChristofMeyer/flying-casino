import { Deck } from "./deck.js";

// ── Custom cursor ──
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', e => {
	cursor.style.left = e.clientX + 'px';
	cursor.style.top  = e.clientY + 'px';
});
const HOVER_SELECTOR = '.lobby-btn, .action-btn, .back-link, .name-input';
document.querySelectorAll(HOVER_SELECTOR).forEach(el => {
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
// use delegation for dynamically-created cards
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


export class BlackjackHTMLHandler {                             // handles html for the blackjack game
    hand;                                                       // html elements
    hitButton;
    stayButton;
    players;
    playersSelfIndex;
    isHost;

    BlackjackDeck = new Deck(2);                                // game elements
    blackjackHands = [];
    values = [];
    bust = false;
    nextTurn = false;

    blackjackHTML = '<ul class = "hand" id ="blackjackHand"></ul> <button class = "hitButton"></button> <button class = "stayButton"></button>'

    constructor (document,players,playersSelfIndex,isHost) {

        this.document = document;
        this.hand = document.getElementById("blackjackHand");
        this.hitButton = document.getElementById("hitButton");
        this.stayButton = document.getElementById("stayButton");
        this.players = players;
        this.playersSelfIndex = playersSelfIndex;
        this.isHost = isHost;

        for (var i = 0; i < this.players.length; i++) {
			const player = this.document.createElement("li")
			player.classList.add("player")
			player.dataset.state = "none"
			player.dataset.index = i
        }
    }

    renderHand(hand) {                                          // render dealt hands to html
		for (let i = 0; i < hand.length; i++) {
			const card = this.document.createElement("li");     // create and populate card into players hand
			card.classList.add("card");
			card.dataset.label = hand[i].label;
			card.dataset.suit = hand[i].suit;
			card.dataset.index = i;

			this.hand.appendChild(card);
		}
	}

    getValue(i) {                                               // function for getting initial value after deal
        for (let j = 0; j < this.blackjackHands[i].length; j++) {
            this.values[i] = this.values[i] + this.blackjackHands[i][j].value;
        }
    }

    hit(i) {                                                    // function for getting new card
        newCard = this.blackjackDeck.cards.pop()                // store card
        this.blackjackHands[i].push(newCard);                   // add card to hand
        this.values [i] = this.values [i] + newCard.value;      // add card to value
        if (this.values [i] > 21) {
            this.bust = true;                                   // if the player's value is greater than 21, the player has busted
            this.values [i] = 0;
        }
    }

    stay() {                                                    // function for player to say their turn is over
        this.nextTurn = true;
    }

    checkWinner() {                                             // function for checking the winner
        winner = 0;                                             // winner is defaulted to the first player
        highestValue = this.values[0];                          // highest value is defaulted to the first value
        for (let i = 1; i < this.players.length; i++){
            if (values[i]>highestValue){
                winner = i;                                     // compare highest value to each value and set new highest value
                highestValue = value[i];
            }
        }
        return winner;                                          // return index of winner
    }

    play() {                                                    // function for playing the game 
        this.BlackjackDeck.deal(this.players.length, this.blackjackHands);// deal
        this.renderHand(this.hand)
        for (let i = 0; i < this.players.length; i++) {         // each player takes their turn
            this.getValue(i);                                   // get value of hand
            while (bust == false && nextTurn == false){         // player turn  
                this.hitButton.addEventListener("click", this.hit(i));
                this.stayButton.addEventListener("click",this.stay());
            }
            this.bust = false;
            this.nextTurn = false;
        }
        this.checkWinner();                                           // check the winner after every player has taken their turn
    }

}

export class Player {
	
	constructor(sendFunction) {
		this.send = sendFunction
	}
}