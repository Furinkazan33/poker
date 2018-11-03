module.exports = function(config) {

    var hands = { 
        carte: { get: false, value: null },
        paire: { get: false, value: null },
        double_paire: { get: false, value: null },
        brelan: { get: false, value: null },
        quinte: { get: false, value: null },
        couleur: { get: false, value: null },
        full: { get: false, value: null },
        carre: { get: false, value: null },
        quinte: { get: false, value: null },
        quinte_flush: { get: false, value: null },
        quinte_royale: { get: false, value: null },
    }
    
    var CARDS = []
    const add_card = (newcard) => {
        var card = card_to_digit(newcard)
    
        for (var i = 0; i < CARDS.length; i++) {
            if(get_value(card) <= get_value(CARDS[i])) {
                break
            }        
        }
        return CARDS.splice(i, 0, card)
    }
    
    const kind_to_digit = c => c == "JACK" ? 11 : (c == "QUEEN" ? 12 : (c == "KING" ? 13 : parseInt(c)))
    const card_to_digit = (card) => ({ color: card.color, kind: kind_to_digit(card.kind) })
    const get_value = card => card.kind
    
    function get_suites() {
        var suites = [
            [CARDS[0]]
        ]
    
        for (let i = 0, s = 0; i < CARDS.length - 1; i++) {
            var diff = get_value(CARDS[i+1]) - get_value(CARDS[i])
    
            if(diff > 1) {
                s++
            }
            if(diff != 0) {
                suites[s].push(CARDS[i+1])
            }
        }
        
        return suites
    }
    
    function get_max_suite(suites) {
        var n = 0
    
        for (let i = 0; i < suites.length - 1; i++) {
            if(suites[i+1].length >= suites[i].length) {
                n = i + 1
            }
        }
        return suites[n]
    }
    
    const quinte = () => get_max_suite(get_suites(CARDS)).length >= 5
    const quinte_flush = () => {
        
        if(quinte()) {
            var quinte = get_max_suite(get_suites(CARDS))
            var couleur = cards
        }
    }
    

    function test() {
    
        var cards = [ 
            { color: "DIAMOND", kind: "QUEEN" },    
            { color: 'SPADE', kind: '8' },
            { color: 'DIAMOND', kind: '2' },
            { color: "HEART", kind: "JACK"},
            { color: 'DIAMOND', kind: '9' },
            { color: 'SPADE', kind: '10' },
            { color: "SPADE", kind: "JACK"},
        ]
        
        cards.forEach(c => this.add_card(c))
    }
    



    /* module */
    return this
}
