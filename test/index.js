var assert = require('assert')
var Cards = require('../cards')

var cards = new Cards({ debug: true })

const I_CARTE = 0
const I_PAIRE = 1
const I_D_PAIRE = 2
const I_BRELAN = 3
const I_QUINTE = 4
const I_COULEUR = 5
const I_FULL = 6
const I_CARRE = 7
const I_QUINTE_F = 8
const I_QUINTE_R = 9

const I_GET = 0
const I_VALUE = 1
const I_COEF = 2



const TYPES = [ I_CARTE, I_PAIRE, I_D_PAIRE, I_BRELAN, I_QUINTE, I_COULEUR, I_FULL, I_CARRE, I_QUINTE_F, I_QUINTE_R ]

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
        types: [ I_CARTE, I_PAIRE, I_QUINTE]
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
        types: [ I_CARTE, I_PAIRE, I_BRELAN, I_FULL ]
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
        types: [ I_CARTE, I_PAIRE, I_CARRE]
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
        types: [ I_CARTE, I_PAIRE, I_QUINTE]
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
        types: [ I_CARTE, I_PAIRE, I_QUINTE, I_COULEUR, I_QUINTE_F]
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
        types: [ I_CARTE, I_COULEUR]
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
        types: [ I_CARTE, I_QUINTE, I_COULEUR, I_QUINTE_F, I_QUINTE_R ]
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
        types: [ I_CARTE, I_QUINTE, I_COULEUR ]
    },
    { 
        cards: [ 
            { color: "DIAMOND", kind: "1" },    
            { color: 'SPADE', kind: '1' },
        ], 
        types: [ I_PAIRE ]
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
            assert(!cards.hands[type][I_GET], "not " + type)
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
            assert(cards.hands[type][I_GET], type)
        })
    })
    
    cb()
}



test_assert(tests, function() {
    test_assert_not(tests, () => {})
})

