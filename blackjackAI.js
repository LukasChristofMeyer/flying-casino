import {getValue, hit, stay, blackjackDeck, blackjackHands, values} from "./blackjack.js"

function AIPlay (i) {
    getValue(i);
    if (values[i] < 17) {
        hit(i)
    } else {
        stay()
    }
}