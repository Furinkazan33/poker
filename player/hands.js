
var hands = [
    { name: "carte" },
    { name: "paire" },
    { name: "double_paire" },
    { name: "brelan" },
    { name: "quinte" },
    { name: "couleur" },
    { name: "full" },
    { name: "carre" },
    { name: "quinte" },
    { name: "quinte_flush" },
    { name: "quinte_royale" },
]

const to_digit = c => 
    c == "JACK" ? "11" :
        (c == "QUEEN" ? "12" :
            (c == "KING" ? "13" : c))

const kind_to_digit = (card) => ({ color: card.color, kind: to_digit(card.kind) })
const cards_to_digit = (cards) => cards.map(kind_to_digit)

var cards = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, "JACK", "QUEEN", "KING" ]
var cards = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13 ]

var cards = [ 
    { color: 'DIAMOND', kind: '10' },
    { color: 'SPADE', kind: '10' }
]



const add_card = function (card) {
    

}

const verif_quinte = function (cards) {
    cards.forEach(card => {
        
    });
}
