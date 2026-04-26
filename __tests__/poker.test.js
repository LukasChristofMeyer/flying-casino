import {
	pokerHandType,
	handScore
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
