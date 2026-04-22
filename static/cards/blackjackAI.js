import {BlackjackHTMLHandler, Player} from "./blackjack.js"
class BlackJackAI extends Player {
    AIIndex;

    constructor (index) {
        this.AIIndex = index;
    }

    AIPlay () {
        BlackjackHTMLHandler.getValue(this.AIIndex);
        if (values[this.AIIndex] < 17) {
            BlackjackHTMLHandler.hit(this.AIIndex);
        } else {
            BlackjackHTMLHandler.stay();
        }
    }
}