var assert = require('assert')
var Cards = require('../cards')



const TYPES = [ "carte", "paire", "double_paire", "brelan", "quinte", "couleur", "full", "carre", "quinte_flush", "quinte_royale" ]

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
        types: [ "carte", "paire", "quinte"]
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
        types: [ "carte", "paire", "double_paire", "brelan", "full" ]
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
        types: [ "carte", "paire", "double_paire", "brelan", "full", "carre"]
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
        types: [ "carte", "paire", "quinte"]
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
        types: [ "carte", "paire", "quinte", "couleur", "quinte_flush"]
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
        types: [ "carte", "couleur"]
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
        types: [ "carte", "quinte", "couleur", "quinte_flush", "quinte_royale" ]
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
        types: [ "carte", "quinte", "couleur" ]
    },
    { 
        cards: [ 
            { color: "DIAMOND", kind: "1" },    
            { color: 'SPADE', kind: '1' },
        ], 
        types: [ "carte", "paire" ]
    },
]

const difference = (arr1, arr2) => arr1.filter(x => !arr2.includes(x))

function test_assert_not(params, cb) {
    params.forEach(p => {
        var mycards = p.cards
        var types_not = difference(TYPES, p.types)
        var cards = new Cards({ debug: true })

        mycards.forEach(c => cards.add_card(c))
        cards.check_hand()

        types_not.forEach(t => {
            switch (t) {
                case "carte":
                    assert(!cards.hands.carte.get, "not " + t)
                    break       
                case "paire":
                    assert(!cards.hands.paire.get, "not " + t)
                    break
                case "double_paire":
                    assert(!cards.hands.double_paire.get, "not " + t)
                    break
                case "brelan":
                    assert(!cards.hands.brelan.get, "not " + t)
                    break
                case "quinte":
                    assert(!cards.hands.quinte.get, "not " + t)
                    break
                case "couleur":
                    assert(!cards.hands.couleur.get, "not " + t)
                    break
                case "full":
                    assert(!cards.hands.full.get, "not " + t)
                    break
                case "carre":
                    assert(!cards.hands.carre.get, "not " + t)
                    break
                case "quinte_flush":
                    assert(!cards.hands.quinte_flush.get, "not " + t)
                    break
                case "quinte_royale":
                    assert(!cards.hands.quinte_royale.get, "not " + t)
                    break
                default:
                    break;
            }
        })
    })

    cb()
}

function test_assert(params, cb) {
    params.forEach(p => {
        var mycards = p.cards
        var types = p.types
        var cards = new Cards({ debug: true })

        mycards.forEach(c => cards.add_card(c))
        cards.check_hand()

        types.forEach(t => {
            switch (t) {
                case "carte":
                    assert(cards.hands.carte.get, t)
                    break       
                case "paire":
                    assert(cards.hands.paire.get, t)
                    break
                case "double_paire":
                    assert(cards.hands.double_paire.get, t)
                    break
                case "brelan":
                    assert(cards.hands.brelan.get, t)
                    break
                case "quinte":
                    assert(cards.hands.quinte.get, t)
                    break
                case "couleur":
                    assert(cards.hands.couleur.get, t)
                    break
                case "full":
                    assert(cards.hands.full.get, t)
                    break
                case "carre":
                    assert(cards.hands.carre.get, t)
                    break
                case "quinte_flush":
                    assert(cards.hands.quinte_flush.get, t)
                    break
                case "quinte_royale":
                    assert(cards.hands.quinte_royale.get, t)
                    break
                default:
                    break;
            }
        })
    })
    
    cb()
}



test_assert(tests, function() {
    test_assert_not(tests, () => {})
})


