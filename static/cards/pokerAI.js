import { Player, pokerHandType, TexasHoldEm, Poker } from "./poker.js";

class PokerAI extends Player {
    AIIndex;

    constructor (index) {
        this.AIIndex = index;
    }

    decisionMaking(pokerHandType) {
        handType = pokerHandType(TexasHoldEm.hand[AIIndex]);                // get hand type

        if (handType == "High Card") {luckCoeffecient = 20;}                // designate multipliar based on strength of hand
        else if (handType == "Pair") {luckCoeffecient = 6;}
        else if (handType == "Two Pair") {luckCoeffecient = 5;}
        else if (handType == "Three of a Kind") {luckCoeffecient = 4;}
        else if (handType == "Straight") {luckCoeffecient = 3;}
        else if (handType == "Flush") {luckCoeffecient = 3;}
        else if (handType == "Full House") {luckCoeffecient = 3;}
        else if (handType == "Four of a Kind") {luckCoeffecient = 1;}
        else if (handType == "Straight Flush") {luckCoeffecient = 1;}

        decision = Math.random() * luckCoeffecient;                         // get random decision value 

        if (decision <= 1) {                                                // apply decision to raise, call, or fold
            if (this.chipsRemaining > 100) {TexasHoldEm.PlayerRaise(this.AIIndex,100);}
            else {TexasHoldEm.PlayerCall(this.AIIndex);}
        }
        else if (decision <= 3) {TexasHoldEm.PlayerCall(this.AIIndex);}
        else {TexasHoldEm.PlayerFold(this.AIIndex);}
    }
}