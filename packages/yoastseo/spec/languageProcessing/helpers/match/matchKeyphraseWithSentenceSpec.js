import JapaneseCustomHelper from "../../../../src/languageProcessing/languages/ja/helpers/matchTextWithWord";
import matchKeyphraseWithSentence from "../../../../src/languageProcessing/helpers/match/matchKeyphraseWithSentence";

/* eslint-disable max-len */
const testCases = [
	{
		testDescription: "No matches in sentence",
		sentence: {
			text: "A sentence with notthekeyphrase.",
			tokens: [
				{ text: "A", sourceCodeRange: { startOffset: 0, endOffset: 1 } },
				{ text: " ", sourceCodeRange: { startOffset: 1, endOffset: 2 } },
				{ text: "sentence", sourceCodeRange: { startOffset: 2, endOffset: 10 } },
				{ text: " ", sourceCodeRange: { startOffset: 10, endOffset: 11 } },
				{ text: "with", sourceCodeRange: { startOffset: 11, endOffset: 15 } },
				{ text: " ", sourceCodeRange: { startOffset: 15, endOffset: 16 } },
				{ text: "notthekeyphrase", sourceCodeRange: { startOffset: 16, endOffset: 31 } },
				{ text: ".", sourceCodeRange: { startOffset: 31, endOffset: 32 } },
			],
			sourceCodeRange: { startOffset: 0, endOffset: 32 } },
		keyphraseForms: [ [ "keyword", "keywords" ] ],
		expectedResult: [],
	},
	{
		testDescription: "should return empty result if keyphraseForms is empty",
		sentence: {
			text: "A sentence with notthekeyphrase.",
			tokens: [
				{ text: "A", sourceCodeRange: { startOffset: 0, endOffset: 1 } },
				{ text: " ", sourceCodeRange: { startOffset: 1, endOffset: 2 } },
				{ text: "sentence", sourceCodeRange: { startOffset: 2, endOffset: 10 } },
				{ text: " ", sourceCodeRange: { startOffset: 10, endOffset: 11 } },
				{ text: "with", sourceCodeRange: { startOffset: 11, endOffset: 15 } },
				{ text: " ", sourceCodeRange: { startOffset: 15, endOffset: 16 } },
				{ text: "notthekeyphrase", sourceCodeRange: { startOffset: 16, endOffset: 31 } },
				{ text: ".", sourceCodeRange: { startOffset: 31, endOffset: 32 } },
			],
			sourceCodeRange: { startOffset: 0, endOffset: 32 } },
		keyphraseForms: [ [] ],
		expectedResult: [],
	},
	{
		testDescription: "One match in sentence of a single-word keyphrase",
		sentence: {
			text: "A sentence with the keyword.",
			tokens: [
				{ text: "A", sourceCodeRange: { startOffset: 0, endOffset: 1 } },
				{ text: " ", sourceCodeRange: { startOffset: 1, endOffset: 2 } },
				{ text: "sentence", sourceCodeRange: { startOffset: 2, endOffset: 10 } },
				{ text: " ", sourceCodeRange: { startOffset: 10, endOffset: 11 } },
				{ text: "with", sourceCodeRange: { startOffset: 11, endOffset: 15 } },
				{ text: " ", sourceCodeRange: { startOffset: 15, endOffset: 16 } },
				{ text: "the", sourceCodeRange: { startOffset: 16, endOffset: 19 } },
				{ text: " ", sourceCodeRange: { startOffset: 19, endOffset: 20 } },
				{ text: "keyword", sourceCodeRange: { startOffset: 20, endOffset: 27 } },
				{ text: ".", sourceCodeRange: { startOffset: 27, endOffset: 28 } },
			],
			sourceCodeRange: { startOffset: 0, endOffset: 28 } },
		keyphraseForms: [ [ "keyword", "keywords" ] ],
		expectedResult: [ { sourceCodeRange: { startOffset: 20, endOffset: 27 }, text: "keyword" } ],
	},
	{
		testDescription: "One match in sentence of a multi word keyphrase",
		sentence: {
			text: "A sentence with the key words.",
			tokens: [
				{ text: "A", sourceCodeRange: { startOffset: 0, endOffset: 1 } },
				{ text: " ", sourceCodeRange: { startOffset: 1, endOffset: 2 } },
				{ text: "sentence", sourceCodeRange: { startOffset: 2, endOffset: 10 } },
				{ text: " ", sourceCodeRange: { startOffset: 10, endOffset: 11 } },
				{ text: "with", sourceCodeRange: { startOffset: 11, endOffset: 15 } },
				{ text: " ", sourceCodeRange: { startOffset: 15, endOffset: 16 } },
				{ text: "the", sourceCodeRange: { startOffset: 16, endOffset: 19 } },
				{ text: " ", sourceCodeRange: { startOffset: 19, endOffset: 20 } },
				{ text: "key", sourceCodeRange: { startOffset: 20, endOffset: 23 } },
				{ text: " ", sourceCodeRange: { startOffset: 23, endOffset: 24 } },
				{ text: "words", sourceCodeRange: { startOffset: 24, endOffset: 29 } },
				{ text: ".", sourceCodeRange: { startOffset: 29, endOffset: 30 } },
			],
			sourceCodeRange: { startOffset: 0, endOffset: 30 } },
		keyphraseForms: [ [ "key" ], [ "word", "words" ] ],
		expectedResult: [ { sourceCodeRange: { endOffset: 23, startOffset: 20 }, text: "key" }, { sourceCodeRange: { endOffset: 29, startOffset: 24 }, text: "words" } ],
	},
	{
		testDescription: "Disregards word order of multi word keyphrases",
		sentence: {
			text: "A word that is key.",
			tokens: [
				{ text: "A", sourceCodeRange: { startOffset: 0, endOffset: 1 } },
				{ text: " ", sourceCodeRange: { startOffset: 1, endOffset: 2 } },
				{ text: "word", sourceCodeRange: { startOffset: 2, endOffset: 6 } },
				{ text: " ", sourceCodeRange: { startOffset: 6, endOffset: 7 } },
				{ text: "that", sourceCodeRange: { startOffset: 7, endOffset: 11 } },
				{ text: " ", sourceCodeRange: { startOffset: 11, endOffset: 12 } },
				{ text: "is", sourceCodeRange: { startOffset: 12, endOffset: 14 } },
				{ text: " ", sourceCodeRange: { startOffset: 14, endOffset: 15 } },
				{ text: "key", sourceCodeRange: { startOffset: 15, endOffset: 18 } },
				{ text: ".", sourceCodeRange: { startOffset: 18, endOffset: 19 } },
			],
			sourceCodeRange: { startOffset: 0, endOffset: 19 } },
		keyphraseForms: [ [ "key" ], [ "word", "words" ] ],
		expectedResult: [ { sourceCodeRange: { endOffset: 6, startOffset: 2 }, text: "word" }, { sourceCodeRange: { endOffset: 18, startOffset: 15 }, text: "key" } ],
	},
	{
		testDescription: "Two matches of multi word keyphrase in sentence",
		sentence: {
			text: "A sentence with the key words and the key word.",
			tokens: [
				{ text: "A", sourceCodeRange: { startOffset: 0, endOffset: 1 } },
				{ text: " ", sourceCodeRange: { startOffset: 1, endOffset: 2 } },
				{ text: "sentence", sourceCodeRange: { startOffset: 2, endOffset: 10 } },
				{ text: " ", sourceCodeRange: { startOffset: 10, endOffset: 11 } },
				{ text: "with", sourceCodeRange: { startOffset: 11, endOffset: 15 } },
				{ text: " ", sourceCodeRange: { startOffset: 15, endOffset: 16 } },
				{ text: "the", sourceCodeRange: { startOffset: 16, endOffset: 19 } },
				{ text: " ", sourceCodeRange: { startOffset: 19, endOffset: 20 } },
				{ text: "key", sourceCodeRange: { startOffset: 20, endOffset: 23 } },
				{ text: " ", sourceCodeRange: { startOffset: 23, endOffset: 24 } },
				{ text: "words", sourceCodeRange: { startOffset: 24, endOffset: 29 } },
				{ text: " ", sourceCodeRange: { startOffset: 29, endOffset: 30 } },
				{ text: "and", sourceCodeRange: { startOffset: 30, endOffset: 33 } },
				{ text: " ", sourceCodeRange: { startOffset: 33, endOffset: 34 } },
				{ text: "the", sourceCodeRange: { startOffset: 34, endOffset: 37 } },
				{ text: " ", sourceCodeRange: { startOffset: 37, endOffset: 38 } },
				{ text: "key", sourceCodeRange: { startOffset: 38, endOffset: 41 } },
				{ text: " ", sourceCodeRange: { startOffset: 41, endOffset: 42 } },
				{ text: "word", sourceCodeRange: { startOffset: 42, endOffset: 46 } },
				{ text: ".", sourceCodeRange: { startOffset: 46, endOffset: 47 } },
			],
			sourceCodeRange: { startOffset: 0, endOffset: 47 } },
		keyphraseForms: [ [ "key" ], [ "word", "words" ] ],
		expectedResult: [
			{ sourceCodeRange: { endOffset: 23, startOffset: 20 }, text: "key" },
			{ sourceCodeRange: { endOffset: 29, startOffset: 24 }, text: "words" },
			{ sourceCodeRange: { endOffset: 41, startOffset: 38 }, text: "key" },
			{ sourceCodeRange: { endOffset: 46, startOffset: 42 }, text: "word" },
		],
	},
	{
		testDescription: "One primary and one secondary match of multi word keyphrase in sentence",
		sentence: {
			text: "A key sentence with a key word.",
			tokens: [
				{ text: "A", sourceCodeRange: { startOffset: 0, endOffset: 1 } },
				{ text: " ", sourceCodeRange: { startOffset: 1, endOffset: 2 } },
				{ text: "key", sourceCodeRange: { startOffset: 2, endOffset: 5 } },
				{ text: " ", sourceCodeRange: { startOffset: 5, endOffset: 6 } },
				{ text: "sentence", sourceCodeRange: { startOffset: 6, endOffset: 14 } },
				{ text: " ", sourceCodeRange: { startOffset: 14, endOffset: 15 } },
				{ text: "with", sourceCodeRange: { startOffset: 15, endOffset: 19 } },
				{ text: " ", sourceCodeRange: { startOffset: 19, endOffset: 20 } },
				{ text: "a", sourceCodeRange: { startOffset: 20, endOffset: 21 } },
				{ text: " ", sourceCodeRange: { startOffset: 21, endOffset: 22 } },
				{ text: "key", sourceCodeRange: { startOffset: 22, endOffset: 25 } },
				{ text: " ", sourceCodeRange: { startOffset: 25, endOffset: 26 } },
				{ text: "word", sourceCodeRange: { startOffset: 26, endOffset: 30 } },
				{ text: ".", sourceCodeRange: { startOffset: 30, endOffset: 31 } },
			],
			sourceCodeRange: { startOffset: 0, endOffset: 31 } },
		keyphraseForms: [ [ "key" ], [ "word", "words" ] ],
		expectedResult: [
			{ sourceCodeRange: { startOffset: 2, endOffset: 5 }, text: "key" },
			{ sourceCodeRange: { endOffset: 25, startOffset: 22 }, text: "key" },
			{ sourceCodeRange: { endOffset: 30, startOffset: 26 }, text: "word" } ],
	},
	{
		testDescription: "No match if a multi word keyphrase is separated with an underscore in the sentence.",
		sentence: {
			text: "A sentence with a key_word.",
			tokens: [
				{ text: "A", sourceCodeRange: { startOffset: 0, endOffset: 1 } },
				{ text: " ", sourceCodeRange: { startOffset: 1, endOffset: 2 } },
				{ text: "sentence", sourceCodeRange: { startOffset: 2, endOffset: 10 } },
				{ text: " ", sourceCodeRange: { startOffset: 10, endOffset: 11 } },
				{ text: "with", sourceCodeRange: { startOffset: 11, endOffset: 15 } },
				{ text: " ", sourceCodeRange: { startOffset: 15, endOffset: 16 } },
				{ text: "a", sourceCodeRange: { startOffset: 16, endOffset: 17 } },
				{ text: " ", sourceCodeRange: { startOffset: 17, endOffset: 18 } },
				{ text: "key", sourceCodeRange: { startOffset: 18, endOffset: 21 } },
				{ text: "_", sourceCodeRange: { startOffset: 21, endOffset: 22 } },
				{ text: "word", sourceCodeRange: { startOffset: 22, endOffset: 26 } },
				{ text: ".", sourceCodeRange: { startOffset: 26, endOffset: 27 } },
			],
			sourceCodeRange: { startOffset: 0, endOffset: 27 } },
		keyphraseForms: [ [ "key", "keys" ], [ "word", "words" ]  ],
		expectedResult: [],
	},
	{
		testDescription: "A match if the key phrase is separated by an underscore in the sentence and in the keyphrase.",
		sentence: {
			text: "A sentence with a key_word.",
			tokens: [
				{ text: "A", sourceCodeRange: { startOffset: 0, endOffset: 1 } },
				{ text: " ", sourceCodeRange: { startOffset: 1, endOffset: 2 } },
				{ text: "sentence", sourceCodeRange: { startOffset: 2, endOffset: 10 } },
				{ text: " ", sourceCodeRange: { startOffset: 10, endOffset: 11 } },
				{ text: "with", sourceCodeRange: { startOffset: 11, endOffset: 15 } },
				{ text: " ", sourceCodeRange: { startOffset: 15, endOffset: 16 } },
				{ text: "a", sourceCodeRange: { startOffset: 16, endOffset: 17 } },
				{ text: " ", sourceCodeRange: { startOffset: 17, endOffset: 18 } },
				{ text: "key", sourceCodeRange: { startOffset: 18, endOffset: 21 } },
				{ text: "_", sourceCodeRange: { startOffset: 21, endOffset: 22 } },
				{ text: "word", sourceCodeRange: { startOffset: 22, endOffset: 26 } },
				{ text: ".", sourceCodeRange: { startOffset: 26, endOffset: 27 } },
			],
			sourceCodeRange: { startOffset: 0, endOffset: 27 } },
		keyphraseForms: [ [ "key_word", "key_words" ] ],
		expectedResult: [
			{ sourceCodeRange: { endOffset: 21, startOffset: 18 }, text: "key" },
			{ sourceCodeRange: { endOffset: 22, startOffset: 21 }, text: "_" },
			{ sourceCodeRange: { endOffset: 26, startOffset: 22 }, text: "word" },
		],
	},
	{
		testDescription: "If there is only a partial match, the partial match is returned.",
		sentence: {
			text: "A sentence with a key.",
			tokens: [
				{ text: "A", sourceCodeRange: { startOffset: 0, endOffset: 1 } },
				{ text: " ", sourceCodeRange: { startOffset: 1, endOffset: 2 } },
				{ text: "sentence", sourceCodeRange: { startOffset: 2, endOffset: 10 } },
				{ text: " ", sourceCodeRange: { startOffset: 10, endOffset: 11 } },
				{ text: "with", sourceCodeRange: { startOffset: 11, endOffset: 15 } },
				{ text: " ", sourceCodeRange: { startOffset: 15, endOffset: 16 } },
				{ text: "a", sourceCodeRange: { startOffset: 16, endOffset: 17 } },
				{ text: " ", sourceCodeRange: { startOffset: 17, endOffset: 18 } },
				{ text: "key", sourceCodeRange: { startOffset: 18, endOffset: 21 } },
				{ text: ".", sourceCodeRange: { startOffset: 21, endOffset: 22 } },
			],
			sourceCodeRange: { startOffset: 0, endOffset: 22 } },
		keyphraseForms: [ [ "key" ], [ "word", "words" ] ],
		expectedResult: [ { sourceCodeRange: { endOffset: 21, startOffset: 18 }, text: "key" } ],

	},
	{
		testDescription: "It is also a match if the keyphrase is lowercase but the occurrence in the sentence is uppercase.",
		sentence: {
			text: "A sentence with a KEY WORD.",
			tokens: [
				{ text: "A", sourceCodeRange: { startOffset: 0, endOffset: 1 } },
				{ text: " ", sourceCodeRange: { startOffset: 1, endOffset: 2 } },
				{ text: "sentence", sourceCodeRange: { startOffset: 2, endOffset: 10 } },
				{ text: " ", sourceCodeRange: { startOffset: 10, endOffset: 11 } },
				{ text: "with", sourceCodeRange: { startOffset: 11, endOffset: 15 } },
				{ text: " ", sourceCodeRange: { startOffset: 15, endOffset: 16 } },
				{ text: "a", sourceCodeRange: { startOffset: 16, endOffset: 17 } },
				{ text: " ", sourceCodeRange: { startOffset: 17, endOffset: 18 } },
				{ text: "KEY", sourceCodeRange: { startOffset: 18, endOffset: 21 } },
				{ text: " ", sourceCodeRange: { startOffset: 21, endOffset: 22 } },
				{ text: "WORD", sourceCodeRange: { startOffset: 22, endOffset: 26 } },
				{ text: ".", sourceCodeRange: { startOffset: 26, endOffset: 27 } },
			],
			sourceCodeRange: { startOffset: 0, endOffset: 27 } },
		keyphraseForms: [ [ "key" ], [ "word", "words" ] ],
		expectedResult: [
			{ sourceCodeRange: { endOffset: 21, startOffset: 18 }, text: "KEY" },
			{ sourceCodeRange: { endOffset: 26, startOffset: 22 }, text: "WORD" },
		],
	},
	{
		testDescription: "Correctly matches if the keyphrase is the last word in the sentence.",
		sentence: {
			text: "A sentence with a key",
			tokens: [
				{ text: "A", sourceCodeRange: { startOffset: 0, endOffset: 1 } },
				{ text: " ", sourceCodeRange: { startOffset: 1, endOffset: 2 } },
				{ text: "sentence", sourceCodeRange: { startOffset: 2, endOffset: 10 } },
				{ text: " ", sourceCodeRange: { startOffset: 10, endOffset: 11 } },
				{ text: "with", sourceCodeRange: { startOffset: 11, endOffset: 15 } },
				{ text: " ", sourceCodeRange: { startOffset: 15, endOffset: 16 } },
				{ text: "a", sourceCodeRange: { startOffset: 16, endOffset: 17 } },
				{ text: " ", sourceCodeRange: { startOffset: 17, endOffset: 18 } },
				{ text: "key", sourceCodeRange: { startOffset: 18, endOffset: 21 } },
			],
			sourceCodeRange: { startOffset: 0, endOffset: 21 } },
		keyphraseForms: [ [ "key" ], [ "word", "words" ] ],
		expectedResult: [ { sourceCodeRange: { endOffset: 21, startOffset: 18 }, text: "key" } ],
	},
	{
		testDescription: "Doesn't return a match if the keyphrase in the text ends with an underscore.",
		sentence: {
			text: "A sentence with a key_",
			tokens: [
				{ text: "A", sourceCodeRange: { startOffset: 0, endOffset: 1 } },
				{ text: " ", sourceCodeRange: { startOffset: 1, endOffset: 2 } },
				{ text: "sentence", sourceCodeRange: { startOffset: 2, endOffset: 10 } },
				{ text: " ", sourceCodeRange: { startOffset: 10, endOffset: 11 } },
				{ text: "with", sourceCodeRange: { startOffset: 11, endOffset: 15 } },
				{ text: " ", sourceCodeRange: { startOffset: 15, endOffset: 16 } },
				{ text: "a", sourceCodeRange: { startOffset: 16, endOffset: 17 } },
				{ text: " ", sourceCodeRange: { startOffset: 17, endOffset: 18 } },
				{ text: "key", sourceCodeRange: { startOffset: 18, endOffset: 21 } },
				{ text: "_", sourceCodeRange: { startOffset: 21, endOffset: 22 } },
			],
			sourceCodeRange: { startOffset: 0, endOffset: 22 } },
		keyphraseForms: [ [ "key" ], [ "word", "words" ] ],
		expectedResult: [],
	},
	{
		testDescription: "Doesn't return a match if the keyphrase in the text ends with a dash.",
		sentence: {
			text: "A sentence with a key-",
			tokens: [
				{ text: "A", sourceCodeRange: { startOffset: 0, endOffset: 1 } },
				{ text: " ", sourceCodeRange: { startOffset: 1, endOffset: 2 } },
				{ text: "sentence", sourceCodeRange: { startOffset: 2, endOffset: 10 } },
				{ text: " ", sourceCodeRange: { startOffset: 10, endOffset: 11 } },
				{ text: "with", sourceCodeRange: { startOffset: 11, endOffset: 15 } },
				{ text: " ", sourceCodeRange: { startOffset: 15, endOffset: 16 } },
				{ text: "a", sourceCodeRange: { startOffset: 16, endOffset: 17 } },
				{ text: " ", sourceCodeRange: { startOffset: 17, endOffset: 18 } },
				{ text: "key", sourceCodeRange: { startOffset: 18, endOffset: 21 } },
				{ text: "-", sourceCodeRange: { startOffset: 21, endOffset: 22 } },
			],
			sourceCodeRange: { startOffset: 0, endOffset: 22 } },
		keyphraseForms: [ [ "key" ], [ "word", "words" ] ],
		expectedResult: [],
	},
	{
		testDescription: "Correctly matches if the sentence ends with an exclamation mark.",
		sentence: {
			text: "A sentence with a key!",
			tokens: [
				{ text: "A", sourceCodeRange: { startOffset: 0, endOffset: 1 } },
				{ text: " ", sourceCodeRange: { startOffset: 1, endOffset: 2 } },
				{ text: "sentence", sourceCodeRange: { startOffset: 2, endOffset: 10 } },
				{ text: " ", sourceCodeRange: { startOffset: 10, endOffset: 11 } },
				{ text: "with", sourceCodeRange: { startOffset: 11, endOffset: 15 } },
				{ text: " ", sourceCodeRange: { startOffset: 15, endOffset: 16 } },
				{ text: "a", sourceCodeRange: { startOffset: 16, endOffset: 17 } },
				{ text: " ", sourceCodeRange: { startOffset: 17, endOffset: 18 } },
				{ text: "key", sourceCodeRange: { startOffset: 18, endOffset: 21 } },
				{ text: "!", sourceCodeRange: { startOffset: 21, endOffset: 22 } },
			],
			sourceCodeRange: { startOffset: 0, endOffset: 22 } },
		keyphraseForms: [ [ "key" ], [ "word", "words" ] ],
		expectedResult: [ { text: "key", sourceCodeRange: { startOffset: 18, endOffset: 21 } } ],
	},
	{
		testDescription: "A keyphrase with a dash matches when the keyphrase occurs with a dash in the text.",
		sentence: {
			text: "A sentence with a key-word.",
			tokens: [
				{ text: "A", sourceCodeRange: { startOffset: 0, endOffset: 1 } },
				{ text: " ", sourceCodeRange: { startOffset: 1, endOffset: 2 } },
				{ text: "sentence", sourceCodeRange: { startOffset: 2, endOffset: 10 } },
				{ text: " ", sourceCodeRange: { startOffset: 10, endOffset: 11 } },
				{ text: "with", sourceCodeRange: { startOffset: 11, endOffset: 15 } },
				{ text: " ", sourceCodeRange: { startOffset: 15, endOffset: 16 } },
				{ text: "a", sourceCodeRange: { startOffset: 16, endOffset: 17 } },
				{ text: " ", sourceCodeRange: { startOffset: 17, endOffset: 18 } },
				{ text: "key", sourceCodeRange: { startOffset: 18, endOffset: 21 } },
				{ text: "-", sourceCodeRange: { startOffset: 21, endOffset: 22 } },
				{ text: "word", sourceCodeRange: { startOffset: 22, endOffset: 26 } },
				{ text: ".", sourceCodeRange: { startOffset: 26, endOffset: 27 } },
			],
			sourceCodeRange: { startOffset: 0, endOffset: 27 } },
		keyphraseForms: [ [ "key-word", "key-words" ] ],
		expectedResult: [
			{ text: "key", sourceCodeRange: { startOffset: 18, endOffset: 21 } },
			{ text: "-", sourceCodeRange: { startOffset: 21, endOffset: 22 } },
			{ text: "word", sourceCodeRange: { startOffset: 22, endOffset: 26 } },
		],
	},
	{
		testDescription: "A keyphrase with a dash does not match when the keyphrase occurs without a dash in the text.",
		sentence: {
			text: "A sentence with a key word.",
			tokens: [
				{ text: "A", sourceCodeRange: { startOffset: 0, endOffset: 1 } },
				{ text: " ", sourceCodeRange: { startOffset: 1, endOffset: 2 } },
				{ text: "sentence", sourceCodeRange: { startOffset: 2, endOffset: 10 } },
				{ text: " ", sourceCodeRange: { startOffset: 10, endOffset: 11 } },
				{ text: "with", sourceCodeRange: { startOffset: 11, endOffset: 15 } },
				{ text: " ", sourceCodeRange: { startOffset: 15, endOffset: 16 } },
				{ text: "a", sourceCodeRange: { startOffset: 16, endOffset: 17 } },
				{ text: " ", sourceCodeRange: { startOffset: 17, endOffset: 18 } },
				{ text: "key", sourceCodeRange: { startOffset: 18, endOffset: 21 } },
				{ text: " ", sourceCodeRange: { startOffset: 21, endOffset: 22 } },
				{ text: "word", sourceCodeRange: { startOffset: 22, endOffset: 26 } },
				{ text: ".", sourceCodeRange: { startOffset: 26, endOffset: 27 } },
			],
			sourceCodeRange: { startOffset: 0, endOffset: 27 } },
		keyphraseForms: [ [ "key-word", "key-words" ] ],
		expectedResult: [],
	},
	{
		testDescription: "A keyphrase without a dash does not match when the keyphrase occurs with a dash in the text.",
		sentence: {
			text: "A sentence with a key-word.",
			tokens: [
				{ text: "A", sourceCodeRange: { startOffset: 0, endOffset: 1 } },
				{ text: " ", sourceCodeRange: { startOffset: 1, endOffset: 2 } },
				{ text: "sentence", sourceCodeRange: { startOffset: 2, endOffset: 10 } },
				{ text: " ", sourceCodeRange: { startOffset: 10, endOffset: 11 } },
				{ text: "with", sourceCodeRange: { startOffset: 11, endOffset: 15 } },
				{ text: " ", sourceCodeRange: { startOffset: 15, endOffset: 16 } },
				{ text: "a", sourceCodeRange: { startOffset: 16, endOffset: 17 } },
				{ text: " ", sourceCodeRange: { startOffset: 17, endOffset: 18 } },
				{ text: "key", sourceCodeRange: { startOffset: 18, endOffset: 21 } },
				{ text: "-", sourceCodeRange: { startOffset: 21, endOffset: 22 } },
				{ text: "word", sourceCodeRange: { startOffset: 22, endOffset: 26 } },
				{ text: ".", sourceCodeRange: { startOffset: 26, endOffset: 27 } },
			],
			sourceCodeRange: { startOffset: 0, endOffset: 27 } },
		keyphraseForms: [ [ "key", "keys" ], [ "word", "words" ] ],
		expectedResult: [ ],
	},
	{
		testDescription: "A keyphrase without a dash matches only with the keyphrase without a dash in the text.",
		sentence: {
			text: "A sentence with a key-word and a key word.",
			tokens: [
				{ text: "A", sourceCodeRange: { startOffset: 0, endOffset: 1 } },
				{ text: " ", sourceCodeRange: { startOffset: 1, endOffset: 2 } },
				{ text: "sentence", sourceCodeRange: { startOffset: 2, endOffset: 10 } },
				{ text: " ", sourceCodeRange: { startOffset: 10, endOffset: 11 } },
				{ text: "with", sourceCodeRange: { startOffset: 11, endOffset: 15 } },
				{ text: " ", sourceCodeRange: { startOffset: 15, endOffset: 16 } },
				{ text: "a", sourceCodeRange: { startOffset: 16, endOffset: 17 } },
				{ text: " ", sourceCodeRange: { startOffset: 17, endOffset: 18 } },
				{ text: "key", sourceCodeRange: { startOffset: 18, endOffset: 21 } },
				{ text: "-", sourceCodeRange: { startOffset: 21, endOffset: 22 } },
				{ text: "word", sourceCodeRange: { startOffset: 22, endOffset: 26 } },
				{ text: " ", sourceCodeRange: { startOffset: 26, endOffset: 27 } },
				{ text: "and", sourceCodeRange: { startOffset: 27, endOffset: 30 } },
				{ text: " ", sourceCodeRange: { startOffset: 30, endOffset: 31 } },
				{ text: "a", sourceCodeRange: { startOffset: 31, endOffset: 32 } },
				{ text: " ", sourceCodeRange: { startOffset: 32, endOffset: 33 } },
				{ text: "key", sourceCodeRange: { startOffset: 33, endOffset: 36 } },
				{ text: " ", sourceCodeRange: { startOffset: 36, endOffset: 37 } },
				{ text: "word", sourceCodeRange: { startOffset: 37, endOffset: 41 } },
				{ text: ".", sourceCodeRange: { startOffset: 41, endOffset: 42 } },
			],
			sourceCodeRange: { startOffset: 0, endOffset: 42 } },
		keyphraseForms: [ [ "key", "keys" ], [ "word", "words" ] ],
		expectedResult: [
			{ text: "key", sourceCodeRange: { startOffset: 33, endOffset: 36 } },
			{ text: "word", sourceCodeRange: { startOffset: 37, endOffset: 41 } },
		],
	},
	{
		testDescription: "A match with a dash and a match without a dash, but the keyphrase contains a dash.",
		sentence: {
			text: "A sentence with a key-word and a key word.",
			tokens: [
				{ text: "A", sourceCodeRange: { startOffset: 0, endOffset: 1 } },
				{ text: " ", sourceCodeRange: { startOffset: 1, endOffset: 2 } },
				{ text: "sentence", sourceCodeRange: { startOffset: 2, endOffset: 10 } },
				{ text: " ", sourceCodeRange: { startOffset: 10, endOffset: 11 } },
				{ text: "with", sourceCodeRange: { startOffset: 11, endOffset: 15 } },
				{ text: " ", sourceCodeRange: { startOffset: 15, endOffset: 16 } },
				{ text: "a", sourceCodeRange: { startOffset: 16, endOffset: 17 } },
				{ text: " ", sourceCodeRange: { startOffset: 17, endOffset: 18 } },
				{ text: "key", sourceCodeRange: { startOffset: 18, endOffset: 21 } },
				{ text: "-", sourceCodeRange: { startOffset: 21, endOffset: 22 } },
				{ text: "word", sourceCodeRange: { startOffset: 22, endOffset: 26 } },
				{ text: " ", sourceCodeRange: { startOffset: 26, endOffset: 27 } },
				{ text: "and", sourceCodeRange: { startOffset: 27, endOffset: 30 } },
				{ text: " ", sourceCodeRange: { startOffset: 30, endOffset: 31 } },
				{ text: "a", sourceCodeRange: { startOffset: 31, endOffset: 32 } },
				{ text: " ", sourceCodeRange: { startOffset: 32, endOffset: 33 } },
				{ text: "key", sourceCodeRange: { startOffset: 33, endOffset: 36 } },
				{ text: " ", sourceCodeRange: { startOffset: 36, endOffset: 37 } },
				{ text: "word", sourceCodeRange: { startOffset: 37, endOffset: 41 } },
				{ text: ".", sourceCodeRange: { startOffset: 41, endOffset: 42 } },
			],
			sourceCodeRange: { startOffset: 0, endOffset: 42 } },
		keyphraseForms: [ [ "key-word", "key-words" ] ],
		expectedResult: [
			{ text: "key", sourceCodeRange: { startOffset: 18, endOffset: 21 } },
			{ text: "-", sourceCodeRange: { startOffset: 21, endOffset: 22 } },
			{ text: "word", sourceCodeRange: { startOffset: 22, endOffset: 26 } },
		],
	},
	{
		testDescription: "When the sentence contains the keyphrase with a dash but in the wrong order, there should be no match.",
		sentence: {
			text: "A sentence with a word-key.",
			tokens: [
				{ text: "A", sourceCodeRange: { startOffset: 0, endOffset: 1 } },
				{ text: " ", sourceCodeRange: { startOffset: 1, endOffset: 2 } },
				{ text: "sentence", sourceCodeRange: { startOffset: 2, endOffset: 10 } },
				{ text: " ", sourceCodeRange: { startOffset: 10, endOffset: 11 } },
				{ text: "with", sourceCodeRange: { startOffset: 11, endOffset: 15 } },
				{ text: " ", sourceCodeRange: { startOffset: 15, endOffset: 16 } },
				{ text: "a", sourceCodeRange: { startOffset: 16, endOffset: 17 } },
				{ text: " ", sourceCodeRange: { startOffset: 17, endOffset: 18 } },
				{ text: "word", sourceCodeRange: { startOffset: 18, endOffset: 22 } },
				{ text: "-", sourceCodeRange: { startOffset: 22, endOffset: 23 } },
				{ text: "key", sourceCodeRange: { startOffset: 23, endOffset: 26 } },
				{ text: ".", sourceCodeRange: { startOffset: 26, endOffset: 27 } },
			],
			sourceCodeRange: { startOffset: 0, endOffset: 27 } },
		keyphraseForms: [ [ "key-word", "key-words" ] ],
		expectedResult: [],
	},
	{
		testDescription: "When the sentence contains the keyphrase with a dash but in the wrong order and the keyphrase does not contain a dash," +
			" there should not be a match.",
		sentence: {
			text: "A sentence with a word-key.",
			tokens: [
				{ text: "A", sourceCodeRange: { startOffset: 0, endOffset: 1 } },
				{ text: " ", sourceCodeRange: { startOffset: 1, endOffset: 2 } },
				{ text: "sentence", sourceCodeRange: { startOffset: 2, endOffset: 10 } },
				{ text: " ", sourceCodeRange: { startOffset: 10, endOffset: 11 } },
				{ text: "with", sourceCodeRange: { startOffset: 11, endOffset: 15 } },
				{ text: " ", sourceCodeRange: { startOffset: 15, endOffset: 16 } },
				{ text: "a", sourceCodeRange: { startOffset: 16, endOffset: 17 } },
				{ text: " ", sourceCodeRange: { startOffset: 17, endOffset: 18 } },
				{ text: "word", sourceCodeRange: { startOffset: 18, endOffset: 22 } },
				{ text: "-", sourceCodeRange: { startOffset: 22, endOffset: 23 } },
				{ text: "key", sourceCodeRange: { startOffset: 23, endOffset: 26 } },
				{ text: ".", sourceCodeRange: { startOffset: 26, endOffset: 27 } },
			],
			sourceCodeRange: { startOffset: 0, endOffset: 27 } },
		keyphraseForms: [ [ "key", "keys" ], [ "word", "words" ] ],
		expectedResult: [ ],
	},
	{
		testDescription: "When the sentence contains a different word with a dash that contains part of the keyphrase, there should be no match.",
		sentence: {
			text: "A sentence with a key-phrase.",
			tokens: [
				{ text: "A", sourceCodeRange: { startOffset: 0, endOffset: 1 } },
				{ text: " ", sourceCodeRange: { startOffset: 1, endOffset: 2 } },
				{ text: "sentence", sourceCodeRange: { startOffset: 2, endOffset: 10 } },
				{ text: " ", sourceCodeRange: { startOffset: 10, endOffset: 11 } },
				{ text: "with", sourceCodeRange: { startOffset: 11, endOffset: 15 } },
				{ text: " ", sourceCodeRange: { startOffset: 15, endOffset: 16 } },
				{ text: "a", sourceCodeRange: { startOffset: 16, endOffset: 17 } },
				{ text: " ", sourceCodeRange: { startOffset: 17, endOffset: 18 } },
				{ text: "key", sourceCodeRange: { startOffset: 18, endOffset: 21 } },
				{ text: "-", sourceCodeRange: { startOffset: 21, endOffset: 22 } },
				{ text: "phrase", sourceCodeRange: { startOffset: 22, endOffset: 28 } },
				{ text: ".", sourceCodeRange: { startOffset: 28, endOffset: 29 } },
			],
			sourceCodeRange: { startOffset: 0, endOffset: 29 } },
		keyphraseForms: [ [ "key", "keys" ], [ "word", "words" ] ],
		expectedResult: [],
	},
	{
		testDescription: "Returns a match when the words from the keyphrase are separated by a dash and spaces.",
		sentence: {
			text: "A sentence with a key - phrase.",
			tokens: [
				{ text: "A", sourceCodeRange: { startOffset: 0, endOffset: 1 } },
				{ text: " ", sourceCodeRange: { startOffset: 1, endOffset: 2 } },
				{ text: "sentence", sourceCodeRange: { startOffset: 2, endOffset: 10 } },
				{ text: " ", sourceCodeRange: { startOffset: 10, endOffset: 11 } },
				{ text: "with", sourceCodeRange: { startOffset: 11, endOffset: 15 } },
				{ text: " ", sourceCodeRange: { startOffset: 15, endOffset: 16 } },
				{ text: "a", sourceCodeRange: { startOffset: 16, endOffset: 17 } },
				{ text: " ", sourceCodeRange: { startOffset: 17, endOffset: 18 } },
				{ text: "key", sourceCodeRange: { startOffset: 18, endOffset: 21 } },
				{ text: " ", sourceCodeRange: { startOffset: 21, endOffset: 22 } },
				{ text: "-", sourceCodeRange: { startOffset: 22, endOffset: 23 } },
				{ text: " ", sourceCodeRange: { startOffset: 23, endOffset: 24 } },
				{ text: "phrase", sourceCodeRange: { startOffset: 24, endOffset: 30 } },
				{ text: ".", sourceCodeRange: { startOffset: 30, endOffset: 31 } },
			],
			sourceCodeRange: { startOffset: 0, endOffset: 29 } },
		keyphraseForms: [ [ "key", "keys" ], [ "phrase", "phrases" ] ],
		expectedResult: [
			{ text: "key", sourceCodeRange: { startOffset: 18, endOffset: 21 } },
			{ text: "phrase", sourceCodeRange: { startOffset: 24, endOffset: 30 } },
		],
	},
	{
		testDescription: "Matches a keyphrase with an apostrophe.",
		sentence: {
			text: "All the keyphrase's forms should be matched.",
			tokens: [
				{ text: "All", sourceCodeRange: { startOffset: 0, endOffset: 3 } },
				{ text: " ", sourceCodeRange: { startOffset: 3, endOffset: 4 } },
				{ text: "the", sourceCodeRange: { startOffset: 4, endOffset: 7 } },
				{ text: " ", sourceCodeRange: { startOffset: 7, endOffset: 8 } },
				{ text: "keyphrase", sourceCodeRange: { startOffset: 8, endOffset: 17 } },
				{ text: "'", sourceCodeRange: { startOffset: 17, endOffset: 18 } },
				{ text: "s", sourceCodeRange: { startOffset: 18, endOffset: 19 } },
				{ text: " ", sourceCodeRange: { startOffset: 19, endOffset: 20 } },
				{ text: "forms", sourceCodeRange: { startOffset: 20, endOffset: 25 } },
				{ text: " ", sourceCodeRange: { startOffset: 25, endOffset: 26 } },
				{ text: "should", sourceCodeRange: { startOffset: 26, endOffset: 32 } },
				{ text: " ", sourceCodeRange: { startOffset: 32, endOffset: 33 } },
				{ text: "be", sourceCodeRange: { startOffset: 34, endOffset: 36 } },
				{ text: " ", sourceCodeRange: { startOffset: 36, endOffset: 37 } },
				{ text: "matched", sourceCodeRange: { startOffset: 37, endOffset: 44 } },
				{ text: ".", sourceCodeRange: { startOffset: 44, endOffset: 45 } },
			],
			sourceCodeRange: { startOffset: 0, endOffset: 45 } },
		keyphraseForms: [ [ "keyphrase", "keyphrases", "keyphrase's" ] ],
		expectedResult: [
			{ text: "keyphrase", sourceCodeRange: { startOffset: 8, endOffset: 17 } },
			{ text: "'", sourceCodeRange: { startOffset: 17, endOffset: 18 } },
			{ text: "s", sourceCodeRange: { startOffset: 18, endOffset: 19 } },
		],
	},
];
// eslint-enable max-len

// The japanese test cases need to be adapted once japanese tokenization is implemented.
// eslint-disable-next-line max-len
const japaneseTestCases = [
	{
		testDescription: "Only a primary match in a language that uses a custom helper to match words.",
		sentence: {
			text: "私の猫はかわいいです。",
			tokens: [
				{ text: "私の猫はかわいいです。", sourceCodeRange: { startOffset: 0, endOffset: 12 } },
			],
			sourceCodeRange: { startOffset: 0, endOffset: 12 } },
		keyphraseForms: [ [ "猫" ], [ "かわいい" ] ],
		locale: "ja",
		matchWordCustomHelper: JapaneseCustomHelper,
		expectedResult: {
			position: 0,
			primaryMatches: [ [
				{ sourceCodeRange: { startOffset: 2, endOffset: 3 }, text: "猫" },
				{ sourceCodeRange: { startOffset: 4, endOffset: 8 }, text: "かわいい" },
			] ],
			secondaryMatches: [],
		},
	},
	{
		testDescription: "A primary and secondary match in a language that uses a custom helper to match words.",
		sentence: {
			text: "私の猫はかわいいですかわいい。",
			tokens: [
				{ text: "私の猫はかわいいですかわいい。", sourceCodeRange: { startOffset: 0, endOffset: 15 } },
			],
			sourceCodeRange: { startOffset: 0, endOffset: 15 } },
		keyphraseForms: [ [ "猫" ], [ "かわいい" ] ],
		locale: "ja",
		matchWordCustomHelper: JapaneseCustomHelper,
		expectedResult: {
			position: 0,
			primaryMatches: [ [
				{ sourceCodeRange: { startOffset: 2, endOffset: 3 }, text: "猫" },
				{ sourceCodeRange: { startOffset: 4, endOffset: 8 }, text: "かわいい" } ] ],
			secondaryMatches: [ [
				{ sourceCodeRange: { startOffset: 10, endOffset: 14 }, text: "かわいい" } ] ],
		},
	},
	{
		testDescription: "Only secondary matches in a language that uses a custom helper to match words.",
		sentence: {
			text: "私のはかわいいですかわいい。",
			tokens: [
				{ text: "私のはかわいいですかわいい。", sourceCodeRange: { startOffset: 0, endOffset: 14 } },
			],
			sourceCodeRange: { startOffset: 0, endOffset: 14 } },
		keyphraseForms: [ [ "猫" ], [ "かわいい" ] ],
		locale: "ja",
		matchWordCustomHelper: JapaneseCustomHelper,
		expectedResult: {
			position: -1,
			primaryMatches: [],
			secondaryMatches: [],
		},
	},
];
// eslint-enable max-len


// eslint-disable-next-line max-len
describe.each( testCases )( "findKeyWordFormsInSentence", ( { testDescription, sentence, keyphraseForms, expectedResult } ) => {
	it( testDescription, () => {
		expect( matchKeyphraseWithSentence( keyphraseForms, sentence ) ).toEqual( expectedResult );
	} );
} );

// eslint-disable-next-line max-len
describe.each( japaneseTestCases )( "findKeyWordFormsInSentence for japanese", ( { testDescription, sentence, keyphraseForms, locale, matchWordCustomHelper, expectedResult } ) => {
	it.skip( testDescription, () => {
		expect( matchKeyphraseWithSentence( sentence, keyphraseForms, locale, matchWordCustomHelper ) ).toEqual( expectedResult );
	} );
} );
