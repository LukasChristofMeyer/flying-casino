import {
	pokerHandType,
	handScore,
	Pot
} from "../static/cards/poker.js"

test("A straight is straight", () => {
	expect(pokerHandType([
		{
			label: "Two",
			value: 2,
			suit: "Club"
		},
		{
			label: "Three",
			value: 3,
			suit: "Spade"
		},
		{
			label: "Four",
			value: 4,
			suit: "Spade"
		},
		{
			label: "Five",
			value: 5,
			suit: "Club"
		},
		{
			label: "Six",
			value: 6,
			suit: "Spade"
		}
	])).toBe("Straight")
})



test("A wrapped straight is straight", () => {
	expect(pokerHandType([
		{
			label: "Two",
			value: 2,
			suit: "Club"
		},
		{
			label: "Three",
			value: 3,
			suit: "Spade"
		},
		{
			label: "Four",
			value: 4,
			suit: "Spade"
		},
		{
			label: "Ace",
			value: 14,
			suit: "Club"
		},
		{
			label: "King",
			value: 13,
			suit: "Spade"
		},
	])).toBe("Straight")
})



test("A wrapped straight will wrap", () => {
	expect(pokerHandType([
		{
			label: "Ace",
			value: 14,
			suit: "Club"
		},
		{
			label: "King",
			value: 13,
			suit: "Spade"
		},
		{
			label: "Two",
			value: 2,
			suit: "Club"
		},
		{
			label: "Three",
			value: 3,
			suit: "Spade"
		},
		{
			label: "Four",
			value: 4,
			suit: "Spade"
		},
		{
			label: "Eight",
			value: 8,
			suit: "Diamond"
		},
	])).toBe("Straight")
})



test("A reversed straight is straight", () => {
	expect(pokerHandType([
		{
			label: "Nine",
			value: 9,
			suit: "Spade"
		},
		{
			label: "Eight",
			value: 8,
			suit: "Spade"
		},
		{
			label: "Seven",
			value: 7,
			suit: "Spade"
		},
		{
			label: "Six",
			value: 6,
			suit: "Club"
		},
		{
			label: "Five",
			value: 5,
			suit: "Spade"
		},
	])).toBe("Straight")
})



test("A straight flush is a straight flush", () => {
	expect(pokerHandType([
		{
			label: "Nine",
			value: 9,
			suit: "Spade"
		},
		{
			label: "Eight",
			value: 8,
			suit: "Spade"
		},
		{
			label: "Seven",
			value: 7,
			suit: "Spade"
		},
		{
			label: "Six",
			value: 6,
			suit: "Spade"
		},
		{
			label: "Five",
			value: 5,
			suit: "Spade"
		},
	])).toBe("Straight Flush")
})



test("A wrapped straight flush is a straight flush", () => {
	expect(pokerHandType([
		{
			label: "Two",
			value: 2,
			suit: "Spade"
		},
		{
			label: "Three",
			value: 3,
			suit: "Spade"
		},
		{
			label: "King",
			value: 13,
			suit: "Spade"
		},
		{
			label: "Four",
			value: 4,
			suit: "Spade"
		},
		{
			label: "Ace",
			value: 14,
			suit: "Spade"
		},
		{
			label: "Nine",
			value: 9,
			suit: "Spade"
		},
	])).toBe("Straight Flush")
})



test("A five of a kind is a five of a kind", () => {
	expect(pokerHandType([
		{
			label: "Ace",
			value: 14,
			suit: "Spade"
		},
		{
			label: "Ace",
			value: 14,
			suit: "Club"
		},
		{
			label: "Ace",
			value: 14,
			suit: "Diamond"
		},
		{
			label: "Ace",
			value: 14,
			suit: "Heart"
		},
		{
			label: "Ace",
			value: 14,
			suit: "Heart"
		},
	])).toBe("Five of a Kind")
})



test("A five of a kind with junk is a five of a kind", () => {
	expect(pokerHandType([
		{
			label: "Ace",
			value: 14,
			suit: "Spade"
		},
		{
			label: "Two",
			value: 2,
			suit: "Spade"
		},
		{
			label: "Two",
			value: 2,
			suit: "Spade"
		},
		{
			label: "Ace",
			value: 14,
			suit: "Club"
		},
		{
			label: "Ace",
			value: 14,
			suit: "Diamond"
		},
		{
			label: "Two",
			value: 2,
			suit: "Diamond"
		},
		{
			label: "Ace",
			value: 14,
			suit: "Heart"
		},
		{
			label: "Ace",
			value: 14,
			suit: "Heart"
		},
	])).toBe("Five of a Kind")
})



test("A four of a kind is a four of a kind", () => {
	expect(pokerHandType([
		{
			label: "Ace",
			value: 14,
			suit: "Spade"
		},
		{
			label: "Ace",
			value: 14,
			suit: "Club"
		},
		{
			label: "Ace",
			value: 14,
			suit: "Diamond"
		},
		{
			label: "Ace",
			value: 14,
			suit: "Heart"
		},
	])).toBe("Four of a Kind")
})



test("A four of a kind with junk is a four of a kind", () => {
	expect(pokerHandType([
		{
			label: "Ace",
			value: 14,
			suit: "Spade"
		},
		{
			label: "Two",
			value: 2,
			suit: "Diamond"
		},
		{
			label: "Ace",
			value: 14,
			suit: "Club"
		},
		{
			label: "Ace",
			value: 14,
			suit: "Diamond"
		},
		{
			label: "Two",
			value: 2,
			suit: "Diamond"
		},
		{
			label: "Ace",
			value: 14,
			suit: "Heart"
		},
		{
			label: "Two",
			value: 2,
			suit: "Heart"
		},
	])).toBe("Four of a Kind")
})



test("A three of a kind is a three of a kind", () => {
	expect(pokerHandType([
		{
			label: "Ace",
			value: 14,
			suit: "Spade"
		},
		{
			label: "Ace",
			value: 14,
			suit: "Club"
		},
		{
			label: "Ace",
			value: 14,
			suit: "Diamond"
		},
	])).toBe("Three of a Kind")
})



test("A two pair is a pair", () => {
	expect(pokerHandType([
		{
			label: "Ace",
			value: 14,
			suit: "Spade"
		},
		{
			label: "Ace",
			value: 14,
			suit: "Club"
		},
		{
			label: "King",
			value: 13,
			suit: "Club"
		},
		{
			label: "King",
			value: 13,
			suit: "Club"
		},
	])).toBe("Two Pair")
})



test("A two pair with junk is a pair", () => {
	expect(pokerHandType([
		{
			label: "Ace",
			value: 14,
			suit: "Spade"
		},
		{
			label: "Ace",
			value: 14,
			suit: "Club"
		},
		{
			label: "Three",
			value: 3,
			suit: "Diamond"
		},
		{
			label: "King",
			value: 13,
			suit: "Club"
		},
		{
			label: "King",
			value: 13,
			suit: "Club"
		},
		{
			label: "Queen",
			value: 12,
			suit: "Heart"
		},
	])).toBe("Two Pair")
})



test("A pair is a pair", () => {
	expect(pokerHandType([
		{
			label: "Ace",
			value: 14,
			suit: "Spade"
		},
		{
			label: "Ace",
			value: 14,
			suit: "Club"
		},
	])).toBe("Pair")
})



test("A highcard is a highcard", () => {
	expect(pokerHandType([
		{
			label: "Ace",
			value: 14,
			suit: "Spade"
		}
	])).toBe("High Card")
})



test("A flush is a flush", () => {
	expect(pokerHandType([
		{
			label: "Ace",
			value: 14,
			suit: "Spade"
		},
		{
			label: "Nine",
			value: 9,
			suit: "Spade"
		},
		{
			label: "Eight",
			value: 8,
			suit: "Spade"
		},
		{
			label: "Five",
			value: 5,
			suit: "Spade"
		},
		{
			label: "Three",
			value: 3,
			suit: "Spade"
		},
		{
			label: "Three",
			value: 3,
			suit: "Diamond"
		},
		{
			label: "Ace",
			value: 14,
			suit: "Diamond"
		},
	])).toBe("Flush")
})






test("Straight score uses straight cards", () => {
	expect(handScore([
		{
			label: "Two",
			value: 2,
			suit: "Spade"
		},
		{
			label: "Three",
			value: 3,
			suit: "Diamond"
		},
		{
			label: "Four",
			value: 4,
			suit: "Spade"
		},
		{
			label: "Five",
			value: 5,
			suit: "Spade"
		},
		{
			label: "Six",
			value: 6,
			suit: "Heart"
		},
		{
			label: "Three",
			value: 3,
			suit: "Diamond"
		},
		{
			label: "Three",
			value: 3,
			suit: "Club"
		},
		{
			label: "King",
			value: 13,
			suit: "Diamond"
		},
	])).toBe(20)
})



test("A straight ace->5 is higher than 2->6", () => {
	expect(handScore([
		{
			label: "Two",
			value: 2,
			suit: "Spade"
		},
		{
			label: "Three",
			value: 3,
			suit: "Diamond"
		},
		{
			label: "Four",
			value: 4,
			suit: "Spade"
		},
		{
			label: "Five",
			value: 5,
			suit: "Spade"
		},
		{
			label: "Six",
			value: 6,
			suit: "Heart"
		},
		{
			label: "Ace",
			value: 14,
			suit: "Diamond"
		},
	])).toBe(28) // As opposed to 2+3+4+5+6=20
})



test("A wrapped straight will wrap, and give a higher score than a non-wrapped", () => {
	expect(handScore([
		{
			label: "Ace",
			value: 14,
			suit: "Diamond"
		},
		{
			label: "Two",
			value: 2,
			suit: "Spade"
		},
		{
			label: "Three",
			value: 3,
			suit: "Diamond"
		},
		{
			label: "Four",
			value: 4,
			suit: "Spade"
		},
		{
			label: "Five",
			value: 5,
			suit: "Spade"
		},
		{
			label: "Six",
			value: 6,
			suit: "Heart"
		}
	])).toBe(28)
})



test("A straight king->4 is higher than 1->6 and an ace->5", () => {
	expect(handScore([
		{
			label: "Two",
			value: 2,
			suit: "Spade"
		},
		{
			label: "Three",
			value: 3,
			suit: "Diamond"
		},
		{
			label: "Four",
			value: 4,
			suit: "Spade"
		},
		{
			label: "Five",
			value: 5,
			suit: "Spade"
		},
		{
			label: "Six",
			value: 6,
			suit: "Heart"
		},
		{
			label: "Ace",
			value: 14,
			suit: "Diamond"
		},
		{
			label: "King",
			value: 13,
			suit: "Diamond"
		},
	])).toBe(36) // As opposed to 14+2+3+4+5 = 28, 2+3+4+5+6 = 20
})



test("A very wrapped straight will wrap, and give a higher score than a non-wrapped", () => {
	expect(handScore([
		{
			label: "Ace",
			value: 14,
			suit: "Diamond"
		},
		{
			label: "King",
			value: 13,
			suit: "Diamond"
		},
		{
			label: "Two",
			value: 2,
			suit: "Spade"
		},
		{
			label: "Three",
			value: 3,
			suit: "Diamond"
		},
		{
			label: "Four",
			value: 4,
			suit: "Spade"
		},
		{
			label: "Five",
			value: 5,
			suit: "Spade"
		},
		{
			label: "Six",
			value: 6,
			suit: "Heart"
		},
		{
			label: "Queen",
			value: 12,
			suit: "Diamond"
		},
	])).toBe(44)
})



test("A non-wrapped straight can be higher than a wrapped straight", () => {
	expect(handScore([
		{
			label: "Ace",
			value: 14,
			suit: "Diamond"
		},
		{
			label: "Two",
			value: 2,
			suit: "Spade"
		},
		{
			label: "Three",
			value: 3,
			suit: "Diamond"
		},
		{
			label: "Four",
			value: 4,
			suit: "Spade"
		},
		{
			label: "Five",
			value: 5,
			suit: "Spade"
		},
		{
			label: "Six",
			value: 6,
			suit: "Heart"
		},
		{
			label: "Seven",
			value: 7,
			suit: "Heart"
		},
		{
			label: "Eight",
			value: 8,
			suit: "Diamond"
		},
	])).toBe(30)
})



test("A non-wrapped straight can be higher than an even more wrapped straight", () => {
	expect(handScore([
		{
			label: "Ace",
			value: 14,
			suit: "Diamond"
		},
		{
			label: "Two",
			value: 2,
			suit: "Spade"
		},
		{
			label: "Three",
			value: 3,
			suit: "Diamond"
		},
		{
			label: "Four",
			value: 4,
			suit: "Spade"
		},
		{
			label: "Five",
			value: 5,
			suit: "Spade"
		},
		{
			label: "Six",
			value: 6,
			suit: "Heart"
		},
		{
			label: "Seven",
			value: 7,
			suit: "Heart"
		},
		{
			label: "Eight",
			value: 8,
			suit: "Diamond"
		},
		{
			label: "Nine",
			value: 9,
			suit: "Club"
		},
		{
			label: "Ten",
			value: 10,
			suit: "Spade"
		},
		{
			label: "King",
			value: 13,
			suit: "Club"
		},
	])).toBe(40)
})



test("Between two straight flushes, we will chose the larger one", () => {
	expect(handScore([
		{
			label: "Ace",
			value: 14,
			suit: "Diamond"
		},
		{
			label: "Two",
			value: 2,
			suit: "Spade"
		},
		{
			label: "Three",
			value: 3,
			suit: "Spade"
		},
		{
			label: "Four",
			value: 4,
			suit: "Spade"
		},
		{
			label: "Five",
			value: 5,
			suit: "Spade"
		},
		{
			label: "Six",
			value: 6,
			suit: "Spade"
		},
		{
			label: "King",
			value: 13,
			suit: "Diamond"
		},
		{
			label: "Queen",
			value: 12,
			suit: "Diamond"
		},
		{
			label: "Jack",
			value: 11,
			suit: "Diamond"
		},
		{
			label: "Ten",
			value: 10,
			suit: "Diamond"
		},
		{
			label: "King",
			value: 13,
			suit: "Spade"
		},
	])).toBe(60)
})



test("We will wrap to chose a larger straight flush", () => {
	expect(handScore([
		{
			label: "Ace",
			value: 14,
			suit: "Diamond"
		},
		{
			label: "Two",
			value: 2,
			suit: "Diamond"
		},
		{
			label: "Three",
			value: 3,
			suit: "Spade"
		},
		{
			label: "Four",
			value: 4,
			suit: "Diamond"
		},
		{
			label: "Three",
			value: 3,
			suit: "Diamond"
		},
		{
			label: "Three",
			value: 3,
			suit: "Spade"
		},
		{
			label: "Four",
			value: 4,
			suit: "Spade"
		},
		{
			label: "Five",
			value: 5,
			suit: "Spade"
		},
		{
			label: "Six",
			value: 6,
			suit: "Spade"
		},
		{
			label: "King",
			value: 13,
			suit: "Diamond"
		},
	])).toBe(36)
})



test("Two Pair gets largest score", () => {
	expect(handScore([
		{
			label: "Ace",
			value: 14,
			suit: "Diamond"
		},
		{
			label: "Two",
			value: 2,
			suit: "Spade"
		},
		{
			label: "Ace",
			value: 14,
			suit: "Diamond"
		},
		{
			label: "Two",
			value: 2,
			suit: "Spade"
		},
		{
			label: "King",
			value: 13,
			suit: "Spade"
		},
		{
			label: "King",
			value: 13,
			suit: "Spade"
		},
		{
			label: "Three",
			value: 3,
			suit: "Heart"
		}
	])).toBe(54)
})



test("Full house gets correct score", () => {
	expect(handScore([
		{
			label: "Ace",
			value: 14,
			suit: "Diamond"
		},
		{
			label: "Two",
			value: 2,
			suit: "Spade"
		},
		{
			label: "Ace",
			value: 14,
			suit: "Diamond"
		},
		{
			label: "Two",
			value: 2,
			suit: "Spade"
		},
		{
			label: "King",
			value: 13,
			suit: "Spade"
		},
		{
			label: "King",
			value: 13,
			suit: "Spade"
		},
		{
			label: "Three",
			value: 3,
			suit: "Heart"
		},
		{
			label: "Two",
			value: 2,
			suit: "Diamond"
		},
	])).toBe(34)
})






test("Calling a bet without anything will thus check", () => {
	let players = [
		{
			chipsRemaining: 100,
			chipsBet: 0
		},
		{
			chipsRemaining: 100,
			chipsBet: 0
		},
		{
			chipsRemaining: 100,
			chipsBet: 0
		},
		{
			chipsRemaining: 100,
			chipsBet: 0
		}
	]
	let pot = new Pot(players)

	for (const player of players) {
		pot.call(player)
	} // An actual call of base bet (10)

	for (const player of players) {
		pot.call(player)
	} // Equivalent to a check, as we have called the bet, and thus have nothing to call.

	expect(players).toStrictEqual([
		{
			chipsRemaining: 90,
			chipsBet: 10
		},
		{
			chipsRemaining: 90,
			chipsBet: 10
		},
		{
			chipsRemaining: 90,
			chipsBet: 10
		},
		{
			chipsRemaining: 90,
			chipsBet: 10
		}
	])
})



test("A pot will split if one player doesn't have enough chips to play with others", () => {
	let players = [
		{ // The odd one out
			chipsRemaining: 50,
			chipsBet: 0
		},
		{
			chipsRemaining: 100,
			chipsBet: 0
		},
		{
			chipsRemaining: 100,
			chipsBet: 0
		},
		{
			chipsRemaining: 100,
			chipsBet: 0
		}
	]
	let pot = new Pot(players, 50)

	for (const player of players) {
		pot.call(player)
	} // Everyone bets 50, and player 0 goes under

	pot.raise(players[1], 50) // Player 1 gets feisty

	for (const player of players) {
		pot.call(player)
	} // Everyone calls another 50, player 0 has an empty call, everyone else bets everything else

	pot.reward([players[0]]) // All-in guy won!

	expect(players).toStrictEqual([
		{ // Well, all-in guy won only half the pot, since it split.
			chipsRemaining: 200,
			chipsBet: 50
		},
		{
			chipsRemaining: 50,
			chipsBet: 100
		},
		{
			chipsRemaining: 50,
			chipsBet: 100
		},
		{
			chipsRemaining: 50,
			chipsBet: 100
		}
	])
})



test("A pot will split many times if many players don't have enough chips to play with others", () => {
	let players = [
		{
			chipsRemaining: 13, // All primes, to ensure stuff actually works
			chipsBet: 0
		},
		{
			chipsRemaining: 31,
			chipsBet: 0
		},
		{
			chipsRemaining: 79,
			chipsBet: 0
		},
		{
			chipsRemaining: 223,
			chipsBet: 0
		}
	]
	let pot = new Pot(players, 13)

	for (const player of players) {
		pot.call(player)
	} // Player 0 is out

	pot.raise(players[1], 18) // Player 1 makes his move

	for (const player of players) {
		pot.call(player)
	} // Player 1 is out

	pot.raise(players[2], 48) // Player 2 makes his move

	for (const player of players) {
		pot.call(player)
	} // Player 2 is out

	pot.raise(players[3], 144) // Player 3 makes his move, just for a joke, I guess?

	for (const player of players) {
		pot.call(player)
	} // Player 3 is out

	pot.reward([players[1]]) // Player 1 won!

	expect(players).toStrictEqual([
		{
			chipsRemaining: 0,
			chipsBet: 13
		},
		{
			chipsRemaining: 106, // 31 * 3 + 13
			chipsBet: 31
		},
		{
			chipsRemaining: 48, // (79-31)
			chipsBet: 79
		},
		{
			chipsRemaining: 192, // (79-31) + (223-79)
			chipsBet: 223
		}
	])
})



test("A pot will split for only those who did not fold", () => {
	let players = [
		{
			chipsRemaining: 13, // All primes, to ensure stuff actually works
			chipsBet: 0
		},
		{
			chipsRemaining: 31,
			chipsBet: 0
		},
		{
			chipsRemaining: 79,
			chipsBet: 0
		},
		{
			chipsRemaining: 223,
			chipsBet: 0
		}
	]
	let pot = new Pot(players, 13)

	for (const player of players) {
		pot.call(player)
	} // Player 0 is out

	pot.raise(players[1], 18) // Player 1 makes his move

	for (const player of players) {
		pot.call(player)
	} // Player 1 is out

	pot.raise(players[2], 48) // Player 2 makes his move

	for (const player of players) {
		pot.call(player)
	} // Player 2 is out

	pot.raise(players[3], 144) // Player 3 makes his move, just for a joke, I guess?

	for (const player of players) {
		pot.call(player)
	} // Player 3 is out


	// For some miraculous reason, player 1 and player 2 folded
	players[1].state = "folded"
	players[2].state = "folded"

	pot.reward([players[0]]) // Player 0 won!

	expect(players).toStrictEqual([
		{
			chipsRemaining: 52, // 13 * 4 = 52
			chipsBet: 13
		},
		{
			chipsRemaining: 0,
			chipsBet: 31,
			state: "folded"
		},
		{
			chipsRemaining: 0,
			chipsBet: 79,
			state: "folded"
		},
		{
			chipsRemaining: 294, // (223 + 31 + 79) - (13 * 3)
			chipsBet: 223
		}
	])
})