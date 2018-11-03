
var cards = require('../cards')()

    
var mycards = [ 
    { color: "DIAMOND", kind: "QUEEN" },    
    { color: 'SPADE', kind: '8' },
    { color: 'DIAMOND', kind: '2' },
    { color: "HEART", kind: "JACK"},
    { color: 'DIAMOND', kind: '9' },
    { color: 'SPADE', kind: '10' },
    { color: "SPADE", kind: "JACK"},
]

console.log(cards)

mycards.forEach(c => cards.add_card(c))

cards.CARDS