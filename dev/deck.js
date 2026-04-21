import {Card} from "./card.js"

export class Deck {
    constructor(handSize){
        this.handSize = handSize;
    }

    //create card values
    AS = new Card("Ace", 11, "Spade");
    TwoS = new Card("Two", 2, "Spade");
    ThreeS = new Card("Three", 3, "Spade");
    FourS = new Card("Four", 4, "Spade");
    FiveS = new Card("Five", 5, "Spade");
    SixS = new Card("Six", 6, "Spade");
    SevenS = new Card("Seven", 7, "Spade");
    EightS = new Card("Eight", 8, "Spade");
    NineS = new Card("Nine", 9, "Spade");
    TenS = new Card("Ten", 10, "Spade");
    JS = new Card("Jack", 10, "Spade");
    QS = new Card("Queen", 10, "Spade");
    KS = new Card("King", 10, "Spade");
    AH = new Card("Ace", 11, "Heart");
    TwoH = new Card("Two", 2, "Heart");
    ThreeH = new Card("Three", 3, "Heart");
    FourH = new Card("Four", 4, "Heart");
    FiveH = new Card("Five", 5, "Heart");
    SixH = new Card("Six", 6, "Heart");
    SevenH = new Card("Seven", 7, "Heart");
    EightH = new Card("Eight", 8, "Heart");
    NineH = new Card("Nine", 9, "Heart");
    TenH = new Card("Ten", 10, "Heart");
    JH = new Card("Jack", 10, "Heart");
    QH = new Card("Queen", 10, "Heart");
    KH = new Card("King", 10, "Heart");
    AC = new Card("Ace", 11, "Club");
    TwoC = new Card("Two", 2, "Club");
    ThreeC = new Card("Three", 3, "Club");
    FourC = new Card("Four", 4, "Club");
    FiveC = new Card("Five", 5, "Club");
    SixC = new Card("Six", 6, "Club");
    SevenC = new Card("Seven", 7, "Club");
    EightC = new Card("Eight", 8, "Club");
    NineC = new Card("Nine", 9, "Club");
    TenC = new Card("Ten", 10, "Club");
    JC = new Card("Jack", 10, "Club");
    QC = new Card("Queen", 10, "Club");
    KC = new Card("King", 10, "Club");
    AD = new Card("Ace", 11, "Diamond");
    TwoD = new Card("Two", 2, "Diamond");
    ThreeD = new Card("Three", 3, "Diamond");
    FourD = new Card("Four", 4, "Diamond");
    FiveD = new Card("Five", 5, "Diamond");
    SixD = new Card("Six", 6, "Diamond");
    SevenD = new Card("Seven", 7, "Diamond");
    EightD = new Card("Eight", 8, "Diamond");
    NineD = new Card("Nine", 9, "Diamond");
    TenD = new Card("Ten", 10, "Diamond");
    JD = new Card("Jack", 10, "Diamond");
    QD = new Card("Queen", 10, "Diamond");
    KD = new Card("King", 10, "Diamond");

    //create deck
    cards = [this.AS, this.TwoS, this.ThreeS, this.FourS, this.FiveS, this.SixS, this.SevenS, this.EightS, this.NineS, this.TenS, this.JS, this.QS, this.KS, this.AH, this.TwoH, this.ThreeH, this.FourH, this.FiveH, this.SixH, this.SevenH, this.EightH, this.NineH, this.TenH, this.JH, this.QH, this.KH, this.AC, this.TwoC, this.ThreeC, this.FourC, this.FiveC, this.SixC, this.SevenC, this.EightC, this.NineC, this.TenC, this.JC, this.QC, this.KC, this.AD, this.TwoD, this.ThreeD, this.FourD, this.FiveD, this.SixD, this.SevenD, this.EightD, this.NineD, this.TenD, this.JD, this.QD, this.KD];

    

    //deck reset
    reset() {
        this.cards = [this.AS, this.TwoS, this.ThreeS, this.FourS, this.FiveS, this.SixS, this.SevenS, this.EightS, this.NineS, this.TenS, this.JS, this.QS, this.KS, this.AH, this.TwoH, this.ThreeH, this.FourH, this.FiveH, this.SixH, this.SevenH, this.EightH, this.NineH, this.TenH, this.JH, this.QH, this.KH, this.AC, this.TwoC, this.ThreeC, this.FourC, this.FiveC, this.SixC, this.SevenC, this.EightC, this.NineC, this.TenC, this.JC, this.QC, this.KC, this.AD, this.TwoD, this.ThreeD, this.FourD, this.FiveD, this.SixD, this.SevenD, this.EightD, this.NineD, this.TenD, this.JD, this.QD, this.KD];
    }

    //shuffle method
    shuffle() {
        this.reset;
        i = this.cards.length();

        while(i != 0){
            let randomIndex = Math.floor(Math.random() * i);                    //get random index below current position
            i--;

            [cards[i], cards[randomIndex]] = [cards[randomIndex], cards[i]];    //swap current value with random value
        }

    }

    //deal method
    deal(playerNumber, hands = []) {
        this.shuffle();

        for (let i = 0; i < playerNumber; i++) {
            hands.push(new Array());                                       //push arrays into hands for number of players
            for (let j = 0; j < this.handSize; j++) {
                hands[i][j] = this.cards.pop();                            //pop last card into hand
            }
        }
    }
}