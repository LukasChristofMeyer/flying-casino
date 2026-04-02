import { Deck } from "./deck.js";

BlackjackDeck = new Deck(2);                                    // create blackjack deck with handsize 2

blackjackHands = [];                                            // array containing the players hands

values = [];                                                    // value of each players hand

bust = false;                                                   // determines if the player has busted

nextTurn = false;                                               // determines if the player is done with their turn

hitButton = document.getElementById("hitButton");               // references for buttons in html
stayButton = document.getElementById("stayButton");

function getValue(i) {                                          // function for getting initial value after deal
    for (let j = 0; j < blackjackHands[i].length(); j++) {
        values[i] = values[i] + blackjackHands[i][j].value;
    }
}

function hit(i) {                                               // function for getting new card
    newCard = blackjackDeck.cards.pop()                         // store card
    blackjackHands[i].push(newCard);                            // add card to hand
    values [i] = values [i] + newCard.value;                    // add card to value
    if (values [i] > 21) {
        bust = true;                                            // if the player's value is greater than 21, the player has busted
        values [i] = 0;
    }
}

function stay() {                                               // function for player to say their turn is over
    nextTurn = true;                                            // set next turn to true
}

function checkWinner() {                                        // function for checking the winner
    winner = 0;                                                 // winner is defaulted to the first player
    highestValue = values[0];                                   // highest value is defaulted to the first value
    for (let i = 1; i < playerNumber; i++){
        if (values[i]>highestValue){
            winner = i;                                         // compare highest value to each value and set new highest value
            highestValue = value[i];
        }
    }
    return winner;                                              // return index of winner
}

function play(playerNumber) {                                   // function for playing the game 
    BlackjackDeck.deal(playerNumber, blackjackHands);           // deal
    for (let i = 0; i < playerNumber; i++) {                    // each player takes their turn
        getValue(i);                                            // get value of hand
        while (bust == false && nextTurn == false){             // loop
        hitButton.addEventListener("click", hit(i));            // hit or
        stayButton.addEventListener("click",stay());            // stay
        }
        bust = false;                                           // reset bust
        nextTurn = false;                                       // and next turn
    }
    checkWinner();                                              // check the winner after every player takes their turn
}