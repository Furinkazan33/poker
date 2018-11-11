module.exports = Cards

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


function Cards(config) {
    if(!config) { config = require('./config.json') }

    this.config = config

    this.hands = [ 
        [false, 0, 0],      // CARTE
        [false, 0, 0.1],    // PAIRE
        [false, 0, 0.2],    // D_PAIRE
        [false, 0, 0.3],    // BRELAN
        [false, 0, 0.5],    // QUINTE
        [false, 0, 0.5],    // COULEUR
        [false, 0, 0.8],    // FULL
        [false, 0, 1],      // CARRE
        [false, 0, 1],      // QUINTE_F
        [false, 0, 1],      // QUINTE_R
    ]
    this.cards = []
    this.nb_as = 0
    this.max_suite = 0
    this.max_color = 0
    this.coef = 0.15
}


Cards.prototype.log = function(message) {
    if(this.config.debug) {
        console.log(message)
    }
}

Cards.prototype.log_hand = function() {
    var json = {
        CARTE: { get: this.hands[I_CARTE][I_GET], value: this.hands[I_CARTE][I_VALUE], coef: this.hands[I_CARTE][I_COEF] },
        PAIRE: { get: this.hands[I_PAIRE][I_GET], value: this.hands[I_PAIRE][I_VALUE], coef: this.hands[I_PAIRE][I_COEF] },    
        D_PAIRE: { get: this.hands[I_D_PAIRE][I_GET], value: this.hands[I_D_PAIRE][I_VALUE], coef: this.hands[I_D_PAIRE][I_COEF] },    
        BRELAN: { get: this.hands[I_BRELAN][I_GET], value: this.hands[I_BRELAN][I_VALUE], coef: this.hands[I_BRELAN][I_COEF] },    
        QUINTE: { get: this.hands[I_QUINTE][I_GET], value: this.hands[I_QUINTE][I_VALUE], coef: this.hands[I_QUINTE][I_COEF] },    
        COULEUR: { get: this.hands[I_COULEUR][I_GET], value: this.hands[I_COULEUR][I_VALUE], coef: this.hands[I_COULEUR][I_COEF] },    
        FULL: { get: this.hands[I_FULL][I_GET], value: this.hands[I_FULL][I_VALUE], coef: this.hands[I_FULL][I_COEF] },    
        CARRE: { get: this.hands[I_CARRE][I_GET], value: this.hands[I_CARRE][I_VALUE], coef: this.hands[I_CARRE][I_COEF] },
        QUINTE_F: { get: this.hands[I_QUINTE_F][I_GET], value: this.hands[I_QUINTE_F][I_VALUE], coef: this.hands[I_QUINTE_F][I_COEF] },
        QUINTE_R: { get: this.hands[I_QUINTE_R][I_GET], value: this.hands[I_QUINTE_R][I_VALUE], coef: this.hands[I_QUINTE_R][I_COEF] },
    }

    console.log(json)
}

Cards.prototype.log_cards = function() {
    console.log(this.cards)
}

Cards.prototype.reset = function() {
    this.hands = [ 
        [false, 0, 0],      // CARTE
        [false, 0, 0.1],    // PAIRE
        [false, 0, 0.2],    // D_PAIRE
        [false, 0, 0.3],    // BRELAN
        [false, 0, 0.5],    // QUINTE
        [false, 0, 0.5],    // COULEUR
        [false, 0, 0.8],    // FULL
        [false, 0, 1],      // CARRE
        [false, 0, 1],      // QUINTE_F
        [false, 0, 1],      // QUINTE_R
    ]
    this.cards = []
    this.nb_as = 0
    this.max_suite = 0
    this.max_color = 0
    this.coef = 0.15
}

Cards.prototype.clone_card = function(card) {
    return { color: card.color, kind: card.kind }
}

Cards.prototype.add_card = function(newcard) {
    var card = this.card_to_digit(newcard)
    var value = this.get_value(card)

    for (var i = 0; i < this.cards.length; i++) {
        if(value <= this.get_value(this.cards[i])) {
            break
        }        
    }
    this.cards.splice(i, 0, card)

    // si un As, alors on ajoute sa deuxième utilisation comme 1 pour les suites
    if(value == 14) {
        var newAs = this.clone_card(card)
        newAs.kind = 1
        this.cards.splice(0, 0, newAs)

        this.nb_as++
    }
}

Cards.prototype.add_cards = function(newcards) {
    newcards.forEach(newcard => {
        this.add_card(newcard)
    })
}

Cards.prototype.kind_to_digit = function(c) { return c == "1" ? 14 : (c == "JACK" ? 11 : (c == "QUEEN" ? 12 : (c == "KING" ? 13 : parseInt(c))))}
Cards.prototype.card_to_digit = function(card) { return { color: card.color, kind: this.kind_to_digit(card.kind) }}
Cards.prototype.get_value = function(card) { return card.kind }
Cards.prototype.get_color = function (card) { return card.color }


Cards.prototype.check_colors = function () {
    var COULEURS = []
    COULEURS["DIAMOND"] = []
    COULEURS["SPADE"] = [] 
    COULEURS["HEART"] = []
    COULEURS["CLUB"] = []

    // Regroupement des couleurs (on ignore les 1)
    for (let i = this.nb_as; i < this.cards.length; i++) {
        var color = this.get_color(this.cards[i])
        var value = this.get_value(this.cards[i])
        
        COULEURS[color].push(this.cards[i])

        var length = COULEURS[color].length
        
        // Vérifications
        if(length >= 5) {
            this.hands[I_COULEUR][I_GET] = true
            this.hands[I_COULEUR][I_VALUE] = value
        }
        if(length > this.max_color) { 
            this.max_color = length
        }
    }
}

Cards.prototype.check_same = function () {
    var identiques = [
        [this.cards[this.nb_as]]
    ]
    
    // Constitution de la liste des cartes identiques (on ignore les 1)
    for (let i = this.nb_as, s = 0; i < this.cards.length - 1; i++) {
        
        var diff = this.get_value(this.cards[i+1]) - this.get_value(this.cards[i])

        if(diff != 0) {
            s++
            identiques.push([])
        }
        identiques[s].push(this.cards[i+1])
    }

    // Vérifications
    for (let i = 0; i < identiques.length; i++) {
        var length = identiques[i].length
        var value = this.get_value(identiques[i][0])

        if(length == 1) {
            this.hands[I_CARTE][I_GET] = true
            if (value > this.hands[I_CARTE][I_VALUE]) {
                this.hands[I_CARTE][I_VALUE] = value
            } 
        }
        if(length == 2) {
            // Double paire
            if(this.hands[I_PAIRE][I_GET]) { 
                this.hands[I_D_PAIRE][I_GET] = true 
                
                if (value > this.hands[I_D_PAIRE][I_VALUE]) {
                    this.hands[I_D_PAIRE][I_VALUE] = value
                }
            }
            // Paire
            this.hands[I_PAIRE][I_GET] = true
            
            if (value > this.hands[I_PAIRE][I_VALUE]) {
                this.hands[I_PAIRE][I_VALUE] = value
            } 
        }
        if(length == 3) { 
            // Brelan
            this.hands[I_BRELAN][I_GET] = true
            
            if (value > this.hands[I_BRELAN][I_VALUE]) {
                this.hands[I_BRELAN][I_VALUE] = value
            }
        }
        if(length == 4) { 
            // Carré
            this.hands[I_CARRE][I_GET] = true
            this.hands[I_CARRE][I_VALUE] = value
        }
    }
    // Full
    if(this.hands[I_BRELAN][I_GET] && this.hands[I_PAIRE][I_GET] && this.hands[I_BRELAN][I_VALUE] != this.hands[I_PAIRE][I_VALUE]) {
        this.hands[I_FULL][I_GET] = true
        this.hands[I_FULL][I_VALUE] = this.hands[I_BRELAN][I_VALUE]
    }
}

Cards.prototype.check_suites = function() {
    var suites = [
        [this.cards[0]]
    ]

    // Constitution de la liste des suites
    for (let i = 0, s = 0; i < this.cards.length - 1; i++) {
        var diff = this.get_value(this.cards[i+1]) - this.get_value(this.cards[i])

        if(diff > 1) {
            s++
            suites.push([])
        }
        if(diff != 0) {
            suites[s].push(this.cards[i+1])
        }
    }
    
    // Vérifications
    for (let i = 0; i < suites.length; i++) {
        var length = suites[i].length

        if(length > this.max_suite) { this.max_suite = length }

        if(length >= 5) {
            this.hands[I_QUINTE][I_GET] = true
            this.hands[I_QUINTE][I_VALUE] = this.get_value(suites[i][length - 1])
        }
    }

    if(this.hands[I_QUINTE][I_GET] && this.hands[I_COULEUR][I_GET] && this.hands[I_QUINTE][I_VALUE] == this.hands[I_COULEUR][I_VALUE]) {
        this.hands[I_QUINTE_F][I_GET] = true
        this.hands[I_QUINTE_F][I_VALUE] = this.hands[I_QUINTE][I_VALUE]
    }

    if(this.hands[I_QUINTE_F][I_GET] && this.hands[I_QUINTE_F][I_VALUE] == 14) {
        this.hands[I_QUINTE_R][I_GET] = true
        this.hands[I_QUINTE_R][I_VALUE] = 14
    }
}
    
Cards.prototype.check_hand = function() {
    this.check_same()
    this.check_colors()
    this.check_suites()

    for (var i = this.hands.length - 1; i >= 0; i--) {
        if(this.hands[i][I_GET]) { 
            coef = this.hands[i][I_COEF]; 
            mult = 1 + this.hands[i][I_VALUE] / 70;
            break 
        }
    }

    var nb_cards = this.cards.length - this.nb_as

    switch (i) {
        
        case I_CARTE:
        if(nb_cards <= 2) { coef = 0.05 }
        if(nb_cards == 3) { 
            coef = 0; 
            if(this.max_color >= 3 || this.max_suite >= 3) {
                coef = 0.1
            } 
        }
        if(nb_cards == 4) { 
            coef = 0 
            if(this.max_color >= 3 || this.max_suite >= 3) {
                coef = 0.1
            }
            if(this.max_color >= 4 || this.max_suite >= 4) {
                coef = 0.2
            } 
        }
        if(nb_cards == 5) { 
            coef = 0 
            if(this.max_color >= 4 || this.max_suite >= 4) {
                coef = 0.15
            } 
        }
        if(nb_cards == 6) { 
            coef = 0

            if(this.max_color >= 4 || this.max_suite >= 4) {
                coef = 0.1
            } 
        }
        if(nb_cards >= 7) { coef = 0 }
        break
        
        case I_PAIRE:
        if(nb_cards == 2) { 
            coef = 0.15
        }
        if(nb_cards == 3) { 
            coef = 0.1 
            if(this.max_color >= 3 || this.max_suite >= 3) {
                coef = 0.1
            }
            if(this.max_color >= 4 || this.max_suite >= 4) {
                coef = 0.2
            } 
        }
        if(nb_cards == 4) { 
            coef = 0.07
            if(this.max_color >= 3 || this.max_suite >= 3) {
                coef = 0.1
            }
            if(this.max_color >= 4 || this.max_suite >= 4) {
                coef = 0.2
            } 
        }
        if(nb_cards == 5) { 
            coef = 0.05
            if(this.max_color >= 3 || this.max_suite >= 3) {
                coef = 0.1
            }
            if(this.max_color >= 4 || this.max_suite >= 4) {
                coef = 0.2
            } 
        }
        if(nb_cards == 6) { 
            coef = 0 
            
        }
        if(nb_cards >= 7) { 
            coef = 0 
            
        }
        break

        case I_D_PAIRE:
        if(nb_cards == 4) { coef = 0.2 }
        if(nb_cards == 5) { coef = 0.17 }
        if(nb_cards == 6) { coef = 0.15 }
        if(nb_cards >= 7) { coef = 0.1 }
        break

        case I_BRELAN:
        if(nb_cards == 3) { coef = 0.5 }
        if(nb_cards == 4) { coef = 0.4 }
        if(nb_cards == 5) { coef = 0.2 }
        if(nb_cards == 6) { coef = 0.2 }
        if(nb_cards >= 7) { coef = 0.15 }
        break

        case I_QUINTE, I_COULEUR:
        if(nb_cards == 5) { coef = 1 }
        if(nb_cards == 6) { coef = 0.8 }
        if(nb_cards >= 7) { coef = 0.5 }
        break

        case I_FULL:
        if(nb_cards == 5) { coef = 1 }
        if(nb_cards == 6) { coef = 1 }
        if(nb_cards >= 7) { coef = 0.8 }
        break

        case I_CARRE, I_QUINTE_F, I_QUINTE_R:
        break
            
        default:
        break
    }

    this.coef = coef * mult

    this.log("coef: " + coef + " * " + mult + " = " + this.coef)
}

