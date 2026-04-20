import {BlackjackHTMLHandler, Player} from "./blackjack.js"
class BlackJackAI extends Player {
    AIIndex;

    AIPlay () {
        BlackjackHTMLHandler.getValue(this.AIIndex);
        if (values[this.AIIndex] < 17) {
            BlackjackHTMLHandler.hit(this.AIIndex)
        } else {
            BlackjackHTMLHandler.stay()
        }
    }
}