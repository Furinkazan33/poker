module.exports = Cards


function Cards(config) {
    if(!config) { config = require('./config.json') }

    this.config = config
    
    this.hands = { 
        carte: { get: false, value: 0, coef: 0 }, // Je ne joue pas la carte haute
        paire: { get: false, value: 0, coef: 0.1 },
        double_paire: { get: false, value: 0, coef: 0.2 },
        brelan: { get: false, value: 0, coef: 0.3 },
        quinte: { get: false, value: 0, coef: 0.5 },
        couleur: { get: false, value: 0, coef: 0.5 },
        full: { get: false, value: 0, coef: 0.8 },
        carre: { get: false, value: 0, coef: 1 },
        quinte_flush: { get: false, value: 0, coef: 1 },
        quinte_royale: { get: false, value: 0, coef: 1 },
    }

    this.cards = []

    this.nb_as = 0
}


Cards.prototype.log = function(message) {
    if(this.config.debug) {
        console.log(message)
        //stream.write(message.toString())
        //stream.write('\n')
    }
}

Cards.prototype.reset = function() {
    this.hands = { 
        carte: { get: false, value: 0, coef: 0 },
        paire: { get: false, value: 0, coef: 0.1 },
        double_paire: { get: false, value: 0, coef: 0.2 },
        brelan: { get: false, value: 0, coef: 0.3 },
        quinte: { get: false, value: 0, coef: 0.5 },
        couleur: { get: false, value: 0, coef: 0.5 },
        full: { get: false, value: 0, coef: 0.8 },
        carre: { get: false, value: 0, coef: 1 },
        quinte_flush: { get: false, value: 0, coef: 1 },
        quinte_royale: { get: false, value: 0, coef: 1 },
    }

    this.cards = []

    this.nb_as = 0
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


Cards.prototype.check_colors = function (cards, hands) {
    //this.log("check_colors")

    var couleurs = { DIAMOND: [], SPADE: [], HEART: [], CLUB: [] }
    var d = 0
    var s = 0
    var h = 0
    var c = 0

    // Regroupement des couleurs (on ignore les 1)
    for (let i = this.nb_as; i < cards.length; i++) {

        var color = this.get_color(cards[i])

        switch (color) {
            case "DIAMOND":
                couleurs.DIAMOND.push(cards[i])
                d++
                break

            case "SPADE":
                couleurs.SPADE.push(cards[i])
                s++
                break

            case "HEART":
                couleurs.HEART.push(cards[i])
                h++
                break

            case "CLUB":
                couleurs.CLUB.push(cards[i])
                c++
                break

            default:
                break;
        }
    }
        
    // Vérifications
    if(d >= 5) { 
        hands.couleur.get = true
        hands.couleur.value = this.get_value(couleurs.DIAMOND[d - 1]) 
    }
    else if(s >= 5) { 
        hands.couleur.get = true
        hands.couleur.value = this.get_value(couleurs.SPADE[s - 1]) 
    }
    else if(h >= 5) { 
        hands.couleur.get = true
        hands.couleur.value = this.get_value(couleurs.HEART[h - 1]) 
    }
    else if(c >= 5) { 
        hands.couleur.get = true
        hands.couleur.value = this.get_value(couleurs.CLUB[c - 1]) 
    } 

    return hands
}

Cards.prototype.check_same = function (cards, hands) {
    //this.log("check_same")

    var identiques = [
        [cards[this.nb_as]]
    ]
    
    // Constitution de la liste des cartes identiques (on ignore les 1)
    for (let i = this.nb_as, s = 0; i < cards.length - 1; i++) {
        
        var diff = this.get_value(cards[i+1]) - this.get_value(cards[i])

        if(diff != 0) {
            s++
            identiques.push([])
        }
        identiques[s].push(cards[i+1])
    }

    // Vérifications
    for (let i = 0; i < identiques.length; i++) {
        var length = identiques[i].length
        var value = this.get_value(identiques[i][0])

        if(length >= 1) {
            hands.carte.get = true
            if (value > hands.carte.value) {
                hands.carte.value = value
            } 
        }
        if(length >= 2) {
            // Double paire
            if(hands.paire.get) { 
                hands.double_paire.get = true 
                
                if (value > hands.double_paire.value) {
                    hands.double_paire.value = value
                }
            }
            // Paire
            hands.paire.get = true
            
            if (value > hands.paire.value) {
                hands.paire.value = value
            } 
        }
        if(length >= 3) { 
            // Brelan
            hands.brelan.get = true
            
            if (value > hands.brelan.value) {
                hands.brelan.value = value
            }
        }
        if(length >= 4) { 
            // Carré
            hands.carre.get = true
            hands.carre.value = value
        }
    }
    // Full
    if(hands.brelan.get && hands.paire.get && hands.brelan.value != hands.paire.value) {
        hands.full.get = true
        hands.full.value = hands.brelan.value
    }

    return hands
}

Cards.prototype.check_suites = function(cards, hands) {
    //this.log("check_suites")

    var suites = [
        [cards[0]]
    ]

    // Constitution de la liste des suites
    for (let i = 0, s = 0; i < cards.length - 1; i++) {
        var diff = this.get_value(cards[i+1]) - this.get_value(cards[i])

        if(diff > 1) {
            s++
            suites.push([])
        }
        if(diff != 0) {
            suites[s].push(cards[i+1])
        }
    }
    
    // Vérifications
    for (let i = 0; i < suites.length; i++) {
        var length = suites[i].length

        if(length >= 5) {
            this.log(suites[i])
            hands.quinte.get = true
            hands.quinte.value = this.get_value(suites[i][length - 1])
        }
    }

    if(hands.quinte.get && hands.couleur.get && hands.quinte.value == hands.couleur.value) {
        hands.quinte_flush.get = true
        hands.quinte_flush.value = hands.quinte.value
    }

    if(hands.quinte_flush.get && hands.quinte_flush.value == 14) {
        hands.quinte_royale.get = true
        hands.quinte_royale.value = 14
    }

    return hands
}
    
Cards.prototype.check_hand = function() {
    this.hands = this.check_same(this.cards, this.hands)
    this.hands = this.check_colors(this.cards, this.hands)
    this.hands = this.check_suites(this.cards, this.hands)

    if(this.hands.quinte_royale.get) { coef = this.hands.quinte_royale.coef; mult = 1 + this.hands.quinte_royale.value / 70; }
    else if(this.hands.quinte_flush.get) { coef = this.hands.quinte_flush.coef; mult = 1 + this.hands.quinte_flush.value / 70; }
    else if(this.hands.carre.get) { coef = this.hands.carre.coef; mult = 1 + this.hands.carre.value / 70;  }
    else if(this.hands.full.get) { coef = this.hands.full.coef; mult = 1 + this.hands.full.value / 70;  }
    else if(this.hands.couleur.get) { coef = this.hands.couleur.coef; mult = 1 + this.hands.couleur.value / 70;  }
    else if(this.hands.quinte.get) { coef = this.hands.quinte.coef; mult = 1 + this.hands.quinte.value / 70;  }
    else if(this.hands.brelan.get) { coef = this.hands.brelan.coef; mult = 1 + this.hands.brelan.value / 70;  }
    else if(this.hands.double_paire.get) { coef = this.hands.double_paire.coef; mult = 1 + this.hands.double_paire.value / 70;  }
    else if(this.hands.paire.get) { coef = this.hands.paire.coef; mult = 1 + this.hands.paire.value / 70;  }
    else if(this.hands.carte.get) { coef = this.hands.carte.coef; mult = 1 + this.hands.carte.value / 70;  }

    var nb_cards = this.cards.length - this.nb_as

    switch (coef) {
        
    // Carte
    case 0:
        if(nb_cards <= 2) { coef = 0.05 }
        if(nb_cards == 3) { coef = 0 }
        if(nb_cards == 4) { coef = 0 }
        if(nb_cards == 5) { coef = 0 }
        if(nb_cards == 6) { coef = 0 }
        if(nb_cards >= 7) { coef = 0 }
        break
    
    // Paire
    case 0.1:
        if(nb_cards == 2) { coef = 0.15 }
        if(nb_cards == 3) { coef = 0.1 }
        if(nb_cards == 4) { coef = 0.07 }
        if(nb_cards == 5) { coef = 0.05 }
        if(nb_cards == 6) { coef = 0 }
        if(nb_cards >= 7) { coef = 0 }
        break

    // Double paire
    case 0.2:
        if(nb_cards == 4) { coef = 0.2 }
        if(nb_cards == 5) { coef = 0.17 }
        if(nb_cards == 6) { coef = 0.15 }
        if(nb_cards >= 7) { coef = 0.1 }
        break

    // Brelan
    case 0.3:
        if(nb_cards == 3) { coef = 0.5 }
        if(nb_cards == 4) { coef = 0.4 }
        if(nb_cards == 5) { coef = 0.2 }
        if(nb_cards == 6) { coef = 0.2 }
        if(nb_cards >= 7) { coef = 0.15 }
        break

    // Quinte ou couleur
    case 0.5:
        if(nb_cards == 5) { coef = 1 }
        if(nb_cards == 6) { coef = 0.8 }
        if(nb_cards >= 7) { coef = 0.5 }
        break

    // Full
    case 0.8:
        if(nb_cards == 5) { coef = 1 }
        if(nb_cards == 6) { coef = 1 }
        if(nb_cards >= 7) { coef = 0.8 }
        break

    default:
        break;
}

    this.log(this.cards)
    this.log(this.hands)
    this.log(coef)
    this.log(coef * mult)

    return coef * mult * this.config.aggressivite
}


