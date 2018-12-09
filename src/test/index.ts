'use strict'

var assert = require('assert')
var Cards = require('../cards')

var cards = new Cards({ debug: true })

import I from '../cards/constants.json'


const TYPES = [ I.CARTE, I.PAIRE, I.D_PAIRE, I.BRELAN, I.QUINTE, I.COULEUR, I.FULL, I.CARRE, I.QUINTE_F, I.QUINTE_R ]

const tests = [
    { 
        cards: [ 
            { color: "DIAMOND", kind: "QUEEN" },    
            { color: 'SPADE', kind: '8' },
            { color: 'DIAMOND', kind: '2' },
            { color: "HEART", kind: "JACK"},
            { color: 'DIAMOND', kind: '9' },
            { color: 'SPADE', kind: '10' },
            { color: "SPADE", kind: "JACK"},
        ], 
        types: [ I.CARTE, I.PAIRE, I.QUINTE]
    },

    { 
        cards: [ 
            { color: "DIAMOND", kind: "QUEEN" },    
            { color: 'SPADE', kind: 'QUEEN' },
            { color: 'DIAMOND', kind: '2' },
            { color: "HEART", kind: "JACK"},
            { color: 'DIAMOND', kind: 'QUEEN' },
            { color: 'SPADE', kind: '10' },
            { color: "SPADE", kind: "JACK"},
        ], 
        types: [ I.CARTE, I.PAIRE, I.BRELAN, I.FULL ]
    },

    { 
        cards: [ 
            { color: "DIAMOND", kind: "QUEEN" },    
            { color: 'SPADE', kind: 'QUEEN' },
            { color: 'DIAMOND', kind: '2' },
            { color: "HEART", kind: "QUEEN"},
            { color: 'DIAMOND', kind: 'QUEEN' },
            { color: 'SPADE', kind: '2' },
            { color: "SPADE", kind: "JACK"},
        ], 
        types: [ I.CARTE, I.PAIRE, I.CARRE]
    },

    { 
        cards: [ 
            { color: "DIAMOND", kind: "2" },    
            { color: 'SPADE', kind: '3' },
            { color: 'DIAMOND', kind: '4' },
            { color: "HEART", kind: "5"},
            { color: 'DIAMOND', kind: '6' },
            { color: 'SPADE', kind: '2' },
            { color: "SPADE", kind: "JACK"},
        ], 
        types: [ I.CARTE, I.PAIRE, I.QUINTE]
    },

    { 
        cards: [ 
            { color: "DIAMOND", kind: "2" },    
            { color: 'DIAMOND', kind: '3' },
            { color: 'DIAMOND', kind: '4' },
            { color: "DIAMOND", kind: "5"},
            { color: 'DIAMOND', kind: '6' },
            { color: 'SPADE', kind: '2' },
            { color: "SPADE", kind: "JACK"},
        ], 
        types: [ I.CARTE, I.PAIRE, I.QUINTE, I.COULEUR, I.QUINTE_F]
    },
    { 
        cards: [ 
            { color: "DIAMOND", kind: "10" },    
            { color: 'DIAMOND', kind: '3' },
            { color: 'DIAMOND', kind: '8' },
            { color: "DIAMOND", kind: "5"},
            { color: 'DIAMOND', kind: 'QUEEN' },
            { color: 'SPADE', kind: '2' },
            { color: "SPADE", kind: "JACK"},
        ], 
        types: [ I.CARTE, I.COULEUR]
    },
    { 
        cards: [ 
            { color: "DIAMOND", kind: "JACK" },    
            { color: 'DIAMOND', kind: 'KING' },
            { color: 'DIAMOND', kind: 'QUEEN' },
            { color: "DIAMOND", kind: "5"},
            { color: 'DIAMOND', kind: '1' },
            { color: 'SPADE', kind: '2' },
            { color: "SPADE", kind: "10"},
        ], 
        types: [ I.CARTE, I.QUINTE, I.COULEUR, I.QUINTE_F, I.QUINTE_R ]
    },
    { 
        cards: [ 
            { color: "DIAMOND", kind: "JACK" },    
            { color: 'DIAMOND', kind: 'KING' },
            { color: 'DIAMOND', kind: 'QUEEN' },
            { color: "DIAMOND", kind: "5"},
            { color: 'DIAMOND', kind: '2' },
            { color: 'SPADE', kind: '1' },
            { color: "SPADE", kind: "10"},
        ], 
        types: [ I.CARTE, I.QUINTE, I.COULEUR ]
    },
    { 
        cards: [ 
            { color: "DIAMOND", kind: "1" },    
            { color: 'SPADE', kind: '1' },
        ], 
        types: [ I.PAIRE ]
    },
]

const difference = (arr1, arr2) => arr1.filter(x => !arr2.includes(x))

function test_assert_not(tests, cb) {
    tests.forEach(test => {
        var mycards = test.cards
        var types_not = difference(TYPES, test.types)

        cards.reset()
        mycards.forEach(c => cards.add_card(c))
        cards.check_hand()

        cards.log_cards()
        cards.log_hand()

        types_not.forEach(type => {
            assert(!cards.hands[type][I.GET], "not " + type)
        })
    })

    cb()
}

function test_assert(tests, cb) {
    tests.forEach(test => {
        var mycards = test.cards
        var types = test.types
        
        cards.reset()
        mycards.forEach(c => cards.add_card(c))
        cards.check_hand()
        
        cards.log_cards()
        cards.log_hand()

        types.forEach(type => {
            cards
            assert(cards.hands[type][I.GET], type)
        })
    })
    
    cb()
}



test_assert(tests, function() {
    test_assert_not(tests, () => {})
})

