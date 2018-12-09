'use strict'

import default_config from './config.json'
import I from './constants.json'

const kind_to_digit = c => c == "1" ? 14 : (c == "JACK" ? 11 : (c == "QUEEN" ? 12 : (c == "KING" ? 13 : parseInt(c))))
const card_to_digit = card => ({ color: card.color, kind: kind_to_digit(card.kind) })
const get_value = card => card.kind
const get_color = card => card.color
const clone_card = card => ({ color: card.color, kind: card.kind })


module.exports = class Cards {
    config = default_config
    hands = null
    cards = []
    nb_as = 0
    max_suite = 0
    max_color = 0
    coef = 0.15


    constructor(config?) {
        if(config) { this.config = config }

        console.log(this.config)

        this.reset()
    }

    reset() {
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

    log(message) {
        if(this.config.debug) {
            console.log(message)
        }
    }

    log_hand () {
        var json = {
            CARTE: { get: this.hands[I.CARTE][I.GET], value: this.hands[I.CARTE][I.VALUE], coef: this.hands[I.CARTE][I.COEF] },
            PAIRE: { get: this.hands[I.PAIRE][I.GET], value: this.hands[I.PAIRE][I.VALUE], coef: this.hands[I.PAIRE][I.COEF] },    
            D_PAIRE: { get: this.hands[I.D_PAIRE][I.GET], value: this.hands[I.D_PAIRE][I.VALUE], coef: this.hands[I.D_PAIRE][I.COEF] },    
            BRELAN: { get: this.hands[I.BRELAN][I.GET], value: this.hands[I.BRELAN][I.VALUE], coef: this.hands[I.BRELAN][I.COEF] },    
            QUINTE: { get: this.hands[I.QUINTE][I.GET], value: this.hands[I.QUINTE][I.VALUE], coef: this.hands[I.QUINTE][I.COEF] },    
            COULEUR: { get: this.hands[I.COULEUR][I.GET], value: this.hands[I.COULEUR][I.VALUE], coef: this.hands[I.COULEUR][I.COEF] },    
            FULL: { get: this.hands[I.FULL][I.GET], value: this.hands[I.FULL][I.VALUE], coef: this.hands[I.FULL][I.COEF] },    
            CARRE: { get: this.hands[I.CARRE][I.GET], value: this.hands[I.CARRE][I.VALUE], coef: this.hands[I.CARRE][I.COEF] },
            QUINTE_F: { get: this.hands[I.QUINTE_F][I.GET], value: this.hands[I.QUINTE_F][I.VALUE], coef: this.hands[I.QUINTE_F][I.COEF] },
            QUINTE_R: { get: this.hands[I.QUINTE_R][I.GET], value: this.hands[I.QUINTE_R][I.VALUE], coef: this.hands[I.QUINTE_R][I.COEF] },
        }

        console.log(json)
    }

    log_cards () {
        console.log(this.cards)
    }

    add_card (newcard) {
        var card = card_to_digit(newcard)
        var value = get_value(card)

        for (var i = 0; i < this.cards.length; i++) {
            if(value <= get_value(this.cards[i])) {
                break
            }        
        }
        this.cards.splice(i, 0, card)

        // si un As, alors on ajoute sa deuxième utilisation comme 1 pour les suites
        if(value == 14) {
            var newAs = clone_card(card)
            newAs.kind = 1
            this.cards.splice(0, 0, newAs)

            this.nb_as++
        }
    }

    add_cards (newcards) {
        newcards.forEach(newcard => {
            this.add_card(newcard)
        })
    }

    check_colors () {
        var COULEURS = []
        COULEURS["DIAMOND"] = []
        COULEURS["SPADE"] = [] 
        COULEURS["HEART"] = []
        COULEURS["CLUB"] = []

        // Regroupement des couleurs (on ignore les 1)
        for (let i = this.nb_as; i < this.cards.length; i++) {
            var color = get_color(this.cards[i])
            var value = get_value(this.cards[i])
            
            COULEURS[color].push(this.cards[i])

            var length = COULEURS[color].length
            
            // Vérifications
            if(length >= 5) {
                this.hands[I.COULEUR][I.GET] = true
                this.hands[I.COULEUR][I.VALUE] = value
            }
            if(length > this.max_color) { 
                this.max_color = length
            }
        }
    }

    check_same () {
        var identiques = [
            [this.cards[this.nb_as]]
        ]
        
        // Constitution de la liste des cartes identiques (on ignore les 1)
        for (let i = this.nb_as, s = 0; i < this.cards.length - 1; i++) {
            
            var diff = get_value(this.cards[i+1]) - get_value(this.cards[i])

            if(diff != 0) {
                s++
                identiques.push([])
            }
            identiques[s].push(this.cards[i+1])
        }

        // Vérifications
        for (let i = 0; i < identiques.length; i++) {
            var length = identiques[i].length
            var value = get_value(identiques[i][0])

            if(length == 1) {
                this.hands[I.CARTE][I.GET] = true
                if (value > this.hands[I.CARTE][I.VALUE]) {
                    this.hands[I.CARTE][I.VALUE] = value
                } 
            }
            if(length == 2) {
                // Double paire
                if(this.hands[I.PAIRE][I.GET]) { 
                    this.hands[I.D_PAIRE][I.GET] = true 
                    
                    if (value > this.hands[I.D_PAIRE][I.VALUE]) {
                        this.hands[I.D_PAIRE][I.VALUE] = value
                    }
                }
                // Paire
                this.hands[I.PAIRE][I.GET] = true
                
                if (value > this.hands[I.PAIRE][I.VALUE]) {
                    this.hands[I.PAIRE][I.VALUE] = value
                } 
            }
            if(length == 3) { 
                // Brelan
                this.hands[I.BRELAN][I.GET] = true
                
                if (value > this.hands[I.BRELAN][I.VALUE]) {
                    this.hands[I.BRELAN][I.VALUE] = value
                }
            }
            if(length == 4) { 
                // Carré
                this.hands[I.CARRE][I.GET] = true
                this.hands[I.CARRE][I.VALUE] = value
            }
        }
        // Full
        if(this.hands[I.BRELAN][I.GET] && this.hands[I.PAIRE][I.GET] && this.hands[I.BRELAN][I.VALUE] != this.hands[I.PAIRE][I.VALUE]) {
            this.hands[I.FULL][I.GET] = true
            this.hands[I.FULL][I.VALUE] = this.hands[I.BRELAN][I.VALUE]
        }
    }

    check_suites () {
        var suites = [
            [this.cards[0]]
        ]

        // Constitution de la liste des suites
        for (let i = 0, s = 0; i < this.cards.length - 1; i++) {
            var diff = get_value(this.cards[i+1]) - get_value(this.cards[i])

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
                this.hands[I.QUINTE][I.GET] = true
                this.hands[I.QUINTE][I.VALUE] = get_value(suites[i][length - 1])
            }
        }

        if(this.hands[I.QUINTE][I.GET] && this.hands[I.COULEUR][I.GET] && this.hands[I.QUINTE][I.VALUE] == this.hands[I.COULEUR][I.VALUE]) {
            this.hands[I.QUINTE_F][I.GET] = true
            this.hands[I.QUINTE_F][I.VALUE] = this.hands[I.QUINTE][I.VALUE]
        }

        if(this.hands[I.QUINTE_F][I.GET] && this.hands[I.QUINTE_F][I.VALUE] == 14) {
            this.hands[I.QUINTE_R][I.GET] = true
            this.hands[I.QUINTE_R][I.VALUE] = 14
        }
    }
        
    check_hand () {
        this.check_same()
        this.check_colors()
        this.check_suites()

        var coef = 0, 
            mult = 1

        for (var i = this.hands.length - 1; i >= 0; i--) {
            if(this.hands[i][I.GET]) { 
                coef = this.hands[i][I.COEF]; 
                mult = 1 + this.hands[i][I.VALUE] / 70;
                break 
            }
        }

        var nb_cards = this.cards.length - this.nb_as

        switch (i) {
            
            case I.CARTE:
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
            
            case I.PAIRE:
            if(nb_cards == 2) { 
                coef = 0.15
            }
            if(nb_cards == 3) { 
                coef = 0.1 
                if(this.max_color >= 3 || this.max_suite >= 3) {
                    coef = 0.1
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

                if(this.max_color >= 4 || this.max_suite >= 4) {
                    coef = 0.1
                } 
            }
            if(nb_cards >= 7) { 
                coef = 0 
            }
            break

            case I.D_PAIRE:
            if(nb_cards == 4) { coef = 0.2 }
            if(nb_cards == 5) { coef = 0.17 }
            if(nb_cards == 6) { coef = 0.15 }
            if(nb_cards >= 7) { coef = 0.1 }
            break

            case I.BRELAN:
            if(nb_cards == 3) { coef = 0.5 }
            if(nb_cards == 4) { coef = 0.4 }
            if(nb_cards == 5) { coef = 0.2 }
            if(nb_cards == 6) { coef = 0.2 }
            if(nb_cards >= 7) { coef = 0.15 }
            break

            case I.QUINTE:
            case I.COULEUR:
            if(nb_cards == 5) { coef = 1 }
            if(nb_cards == 6) { coef = 0.8 }
            if(nb_cards >= 7) { coef = 0.5 }
            break

            case I.FULL:
            if(nb_cards == 5) { coef = 1 }
            if(nb_cards == 6) { coef = 1 }
            if(nb_cards >= 7) { coef = 0.8 }
            break

            case I.CARRE:
            case I.QUINTE_F:
            case I.QUINTE_R:
            break
                
            default:
            break
        }

        this.coef = coef * mult

        this.log("coef: " + coef + " * " + mult + " = " + this.coef)
    }
}