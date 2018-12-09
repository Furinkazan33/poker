'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require('assert');
var Cards = require('../cards');
var cards = new Cards({ debug: true });
const constants_json_1 = __importDefault(require("../cards/constants.json"));
const TYPES = [constants_json_1.default.CARTE, constants_json_1.default.PAIRE, constants_json_1.default.D_PAIRE, constants_json_1.default.BRELAN, constants_json_1.default.QUINTE, constants_json_1.default.COULEUR, constants_json_1.default.FULL, constants_json_1.default.CARRE, constants_json_1.default.QUINTE_F, constants_json_1.default.QUINTE_R];
const tests = [
    {
        cards: [
            { color: "DIAMOND", kind: "QUEEN" },
            { color: 'SPADE', kind: '8' },
            { color: 'DIAMOND', kind: '2' },
            { color: "HEART", kind: "JACK" },
            { color: 'DIAMOND', kind: '9' },
            { color: 'SPADE', kind: '10' },
            { color: "SPADE", kind: "JACK" },
        ],
        types: [constants_json_1.default.CARTE, constants_json_1.default.PAIRE, constants_json_1.default.QUINTE]
    },
    {
        cards: [
            { color: "DIAMOND", kind: "QUEEN" },
            { color: 'SPADE', kind: 'QUEEN' },
            { color: 'DIAMOND', kind: '2' },
            { color: "HEART", kind: "JACK" },
            { color: 'DIAMOND', kind: 'QUEEN' },
            { color: 'SPADE', kind: '10' },
            { color: "SPADE", kind: "JACK" },
        ],
        types: [constants_json_1.default.CARTE, constants_json_1.default.PAIRE, constants_json_1.default.BRELAN, constants_json_1.default.FULL]
    },
    {
        cards: [
            { color: "DIAMOND", kind: "QUEEN" },
            { color: 'SPADE', kind: 'QUEEN' },
            { color: 'DIAMOND', kind: '2' },
            { color: "HEART", kind: "QUEEN" },
            { color: 'DIAMOND', kind: 'QUEEN' },
            { color: 'SPADE', kind: '2' },
            { color: "SPADE", kind: "JACK" },
        ],
        types: [constants_json_1.default.CARTE, constants_json_1.default.PAIRE, constants_json_1.default.CARRE]
    },
    {
        cards: [
            { color: "DIAMOND", kind: "2" },
            { color: 'SPADE', kind: '3' },
            { color: 'DIAMOND', kind: '4' },
            { color: "HEART", kind: "5" },
            { color: 'DIAMOND', kind: '6' },
            { color: 'SPADE', kind: '2' },
            { color: "SPADE", kind: "JACK" },
        ],
        types: [constants_json_1.default.CARTE, constants_json_1.default.PAIRE, constants_json_1.default.QUINTE]
    },
    {
        cards: [
            { color: "DIAMOND", kind: "2" },
            { color: 'DIAMOND', kind: '3' },
            { color: 'DIAMOND', kind: '4' },
            { color: "DIAMOND", kind: "5" },
            { color: 'DIAMOND', kind: '6' },
            { color: 'SPADE', kind: '2' },
            { color: "SPADE", kind: "JACK" },
        ],
        types: [constants_json_1.default.CARTE, constants_json_1.default.PAIRE, constants_json_1.default.QUINTE, constants_json_1.default.COULEUR, constants_json_1.default.QUINTE_F]
    },
    {
        cards: [
            { color: "DIAMOND", kind: "10" },
            { color: 'DIAMOND', kind: '3' },
            { color: 'DIAMOND', kind: '8' },
            { color: "DIAMOND", kind: "5" },
            { color: 'DIAMOND', kind: 'QUEEN' },
            { color: 'SPADE', kind: '2' },
            { color: "SPADE", kind: "JACK" },
        ],
        types: [constants_json_1.default.CARTE, constants_json_1.default.COULEUR]
    },
    {
        cards: [
            { color: "DIAMOND", kind: "JACK" },
            { color: 'DIAMOND', kind: 'KING' },
            { color: 'DIAMOND', kind: 'QUEEN' },
            { color: "DIAMOND", kind: "5" },
            { color: 'DIAMOND', kind: '1' },
            { color: 'SPADE', kind: '2' },
            { color: "SPADE", kind: "10" },
        ],
        types: [constants_json_1.default.CARTE, constants_json_1.default.QUINTE, constants_json_1.default.COULEUR, constants_json_1.default.QUINTE_F, constants_json_1.default.QUINTE_R]
    },
    {
        cards: [
            { color: "DIAMOND", kind: "JACK" },
            { color: 'DIAMOND', kind: 'KING' },
            { color: 'DIAMOND', kind: 'QUEEN' },
            { color: "DIAMOND", kind: "5" },
            { color: 'DIAMOND', kind: '2' },
            { color: 'SPADE', kind: '1' },
            { color: "SPADE", kind: "10" },
        ],
        types: [constants_json_1.default.CARTE, constants_json_1.default.QUINTE, constants_json_1.default.COULEUR]
    },
    {
        cards: [
            { color: "DIAMOND", kind: "1" },
            { color: 'SPADE', kind: '1' },
        ],
        types: [constants_json_1.default.PAIRE]
    },
];
const difference = (arr1, arr2) => arr1.filter(x => !arr2.includes(x));
function test_assert_not(tests, cb) {
    tests.forEach(test => {
        var mycards = test.cards;
        var types_not = difference(TYPES, test.types);
        cards.reset();
        mycards.forEach(c => cards.add_card(c));
        cards.check_hand();
        cards.log_cards();
        cards.log_hand();
        types_not.forEach(type => {
            assert(!cards.hands[type][constants_json_1.default.GET], "not " + type);
        });
    });
    cb();
}
function test_assert(tests, cb) {
    tests.forEach(test => {
        var mycards = test.cards;
        var types = test.types;
        cards.reset();
        mycards.forEach(c => cards.add_card(c));
        cards.check_hand();
        cards.log_cards();
        cards.log_hand();
        types.forEach(type => {
            cards;
            assert(cards.hands[type][constants_json_1.default.GET], type);
        });
    });
    cb();
}
test_assert(tests, function () {
    test_assert_not(tests, () => { });
});
//# sourceMappingURL=index.js.map