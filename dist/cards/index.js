'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_json_1 = __importDefault(require("./config.json"));
const constants_json_1 = __importDefault(require("./constants.json"));
const kind_to_digit = c => c == "1" ? 14 : (c == "JACK" ? 11 : (c == "QUEEN" ? 12 : (c == "KING" ? 13 : parseInt(c))));
const card_to_digit = card => ({ color: card.color, kind: kind_to_digit(card.kind) });
const get_value = card => card.kind;
const get_color = card => card.color;
const clone_card = card => ({ color: card.color, kind: card.kind });
module.exports = class Cards {
    constructor(config) {
        this.config = config_json_1.default;
        this.hands = null;
        this.cards = [];
        this.nb_as = 0;
        this.max_suite = 0;
        this.max_color = 0;
        this.coef = 0.15;
        if (config) {
            this.config = config;
        }
        console.log(this.config);
        this.reset();
    }
    reset() {
        this.hands = [
            [false, 0, 0],
            [false, 0, 0.1],
            [false, 0, 0.2],
            [false, 0, 0.3],
            [false, 0, 0.5],
            [false, 0, 0.5],
            [false, 0, 0.8],
            [false, 0, 1],
            [false, 0, 1],
            [false, 0, 1],
        ];
        this.cards = [];
        this.nb_as = 0;
        this.max_suite = 0;
        this.max_color = 0;
        this.coef = 0.15;
    }
    log(message) {
        if (this.config.debug) {
            console.log(message);
        }
    }
    log_hand() {
        var json = {
            CARTE: { get: this.hands[constants_json_1.default.CARTE][constants_json_1.default.GET], value: this.hands[constants_json_1.default.CARTE][constants_json_1.default.VALUE], coef: this.hands[constants_json_1.default.CARTE][constants_json_1.default.COEF] },
            PAIRE: { get: this.hands[constants_json_1.default.PAIRE][constants_json_1.default.GET], value: this.hands[constants_json_1.default.PAIRE][constants_json_1.default.VALUE], coef: this.hands[constants_json_1.default.PAIRE][constants_json_1.default.COEF] },
            D_PAIRE: { get: this.hands[constants_json_1.default.D_PAIRE][constants_json_1.default.GET], value: this.hands[constants_json_1.default.D_PAIRE][constants_json_1.default.VALUE], coef: this.hands[constants_json_1.default.D_PAIRE][constants_json_1.default.COEF] },
            BRELAN: { get: this.hands[constants_json_1.default.BRELAN][constants_json_1.default.GET], value: this.hands[constants_json_1.default.BRELAN][constants_json_1.default.VALUE], coef: this.hands[constants_json_1.default.BRELAN][constants_json_1.default.COEF] },
            QUINTE: { get: this.hands[constants_json_1.default.QUINTE][constants_json_1.default.GET], value: this.hands[constants_json_1.default.QUINTE][constants_json_1.default.VALUE], coef: this.hands[constants_json_1.default.QUINTE][constants_json_1.default.COEF] },
            COULEUR: { get: this.hands[constants_json_1.default.COULEUR][constants_json_1.default.GET], value: this.hands[constants_json_1.default.COULEUR][constants_json_1.default.VALUE], coef: this.hands[constants_json_1.default.COULEUR][constants_json_1.default.COEF] },
            FULL: { get: this.hands[constants_json_1.default.FULL][constants_json_1.default.GET], value: this.hands[constants_json_1.default.FULL][constants_json_1.default.VALUE], coef: this.hands[constants_json_1.default.FULL][constants_json_1.default.COEF] },
            CARRE: { get: this.hands[constants_json_1.default.CARRE][constants_json_1.default.GET], value: this.hands[constants_json_1.default.CARRE][constants_json_1.default.VALUE], coef: this.hands[constants_json_1.default.CARRE][constants_json_1.default.COEF] },
            QUINTE_F: { get: this.hands[constants_json_1.default.QUINTE_F][constants_json_1.default.GET], value: this.hands[constants_json_1.default.QUINTE_F][constants_json_1.default.VALUE], coef: this.hands[constants_json_1.default.QUINTE_F][constants_json_1.default.COEF] },
            QUINTE_R: { get: this.hands[constants_json_1.default.QUINTE_R][constants_json_1.default.GET], value: this.hands[constants_json_1.default.QUINTE_R][constants_json_1.default.VALUE], coef: this.hands[constants_json_1.default.QUINTE_R][constants_json_1.default.COEF] },
        };
        console.log(json);
    }
    log_cards() {
        console.log(this.cards);
    }
    add_card(newcard) {
        var card = card_to_digit(newcard);
        var value = get_value(card);
        for (var i = 0; i < this.cards.length; i++) {
            if (value <= get_value(this.cards[i])) {
                break;
            }
        }
        this.cards.splice(i, 0, card);
        // si un As, alors on ajoute sa deuxième utilisation comme 1 pour les suites
        if (value == 14) {
            var newAs = clone_card(card);
            newAs.kind = 1;
            this.cards.splice(0, 0, newAs);
            this.nb_as++;
        }
    }
    add_cards(newcards) {
        newcards.forEach(newcard => {
            this.add_card(newcard);
        });
    }
    check_colors() {
        var COULEURS = [];
        COULEURS["DIAMOND"] = [];
        COULEURS["SPADE"] = [];
        COULEURS["HEART"] = [];
        COULEURS["CLUB"] = [];
        // Regroupement des couleurs (on ignore les 1)
        for (let i = this.nb_as; i < this.cards.length; i++) {
            var color = get_color(this.cards[i]);
            var value = get_value(this.cards[i]);
            COULEURS[color].push(this.cards[i]);
            var length = COULEURS[color].length;
            // Vérifications
            if (length >= 5) {
                this.hands[constants_json_1.default.COULEUR][constants_json_1.default.GET] = true;
                this.hands[constants_json_1.default.COULEUR][constants_json_1.default.VALUE] = value;
            }
            if (length > this.max_color) {
                this.max_color = length;
            }
        }
    }
    check_same() {
        var identiques = [
            [this.cards[this.nb_as]]
        ];
        // Constitution de la liste des cartes identiques (on ignore les 1)
        for (let i = this.nb_as, s = 0; i < this.cards.length - 1; i++) {
            var diff = get_value(this.cards[i + 1]) - get_value(this.cards[i]);
            if (diff != 0) {
                s++;
                identiques.push([]);
            }
            identiques[s].push(this.cards[i + 1]);
        }
        // Vérifications
        for (let i = 0; i < identiques.length; i++) {
            var length = identiques[i].length;
            var value = get_value(identiques[i][0]);
            if (length == 1) {
                this.hands[constants_json_1.default.CARTE][constants_json_1.default.GET] = true;
                if (value > this.hands[constants_json_1.default.CARTE][constants_json_1.default.VALUE]) {
                    this.hands[constants_json_1.default.CARTE][constants_json_1.default.VALUE] = value;
                }
            }
            if (length == 2) {
                // Double paire
                if (this.hands[constants_json_1.default.PAIRE][constants_json_1.default.GET]) {
                    this.hands[constants_json_1.default.D_PAIRE][constants_json_1.default.GET] = true;
                    if (value > this.hands[constants_json_1.default.D_PAIRE][constants_json_1.default.VALUE]) {
                        this.hands[constants_json_1.default.D_PAIRE][constants_json_1.default.VALUE] = value;
                    }
                }
                // Paire
                this.hands[constants_json_1.default.PAIRE][constants_json_1.default.GET] = true;
                if (value > this.hands[constants_json_1.default.PAIRE][constants_json_1.default.VALUE]) {
                    this.hands[constants_json_1.default.PAIRE][constants_json_1.default.VALUE] = value;
                }
            }
            if (length == 3) {
                // Brelan
                this.hands[constants_json_1.default.BRELAN][constants_json_1.default.GET] = true;
                if (value > this.hands[constants_json_1.default.BRELAN][constants_json_1.default.VALUE]) {
                    this.hands[constants_json_1.default.BRELAN][constants_json_1.default.VALUE] = value;
                }
            }
            if (length == 4) {
                // Carré
                this.hands[constants_json_1.default.CARRE][constants_json_1.default.GET] = true;
                this.hands[constants_json_1.default.CARRE][constants_json_1.default.VALUE] = value;
            }
        }
        // Full
        if (this.hands[constants_json_1.default.BRELAN][constants_json_1.default.GET] && this.hands[constants_json_1.default.PAIRE][constants_json_1.default.GET] && this.hands[constants_json_1.default.BRELAN][constants_json_1.default.VALUE] != this.hands[constants_json_1.default.PAIRE][constants_json_1.default.VALUE]) {
            this.hands[constants_json_1.default.FULL][constants_json_1.default.GET] = true;
            this.hands[constants_json_1.default.FULL][constants_json_1.default.VALUE] = this.hands[constants_json_1.default.BRELAN][constants_json_1.default.VALUE];
        }
    }
    check_suites() {
        var suites = [
            [this.cards[0]]
        ];
        // Constitution de la liste des suites
        for (let i = 0, s = 0; i < this.cards.length - 1; i++) {
            var diff = get_value(this.cards[i + 1]) - get_value(this.cards[i]);
            if (diff > 1) {
                s++;
                suites.push([]);
            }
            if (diff != 0) {
                suites[s].push(this.cards[i + 1]);
            }
        }
        // Vérifications
        for (let i = 0; i < suites.length; i++) {
            var length = suites[i].length;
            if (length > this.max_suite) {
                this.max_suite = length;
            }
            if (length >= 5) {
                this.hands[constants_json_1.default.QUINTE][constants_json_1.default.GET] = true;
                this.hands[constants_json_1.default.QUINTE][constants_json_1.default.VALUE] = get_value(suites[i][length - 1]);
            }
        }
        if (this.hands[constants_json_1.default.QUINTE][constants_json_1.default.GET] && this.hands[constants_json_1.default.COULEUR][constants_json_1.default.GET] && this.hands[constants_json_1.default.QUINTE][constants_json_1.default.VALUE] == this.hands[constants_json_1.default.COULEUR][constants_json_1.default.VALUE]) {
            this.hands[constants_json_1.default.QUINTE_F][constants_json_1.default.GET] = true;
            this.hands[constants_json_1.default.QUINTE_F][constants_json_1.default.VALUE] = this.hands[constants_json_1.default.QUINTE][constants_json_1.default.VALUE];
        }
        if (this.hands[constants_json_1.default.QUINTE_F][constants_json_1.default.GET] && this.hands[constants_json_1.default.QUINTE_F][constants_json_1.default.VALUE] == 14) {
            this.hands[constants_json_1.default.QUINTE_R][constants_json_1.default.GET] = true;
            this.hands[constants_json_1.default.QUINTE_R][constants_json_1.default.VALUE] = 14;
        }
    }
    check_hand() {
        this.check_same();
        this.check_colors();
        this.check_suites();
        var coef = 0, mult = 1;
        for (var i = this.hands.length - 1; i >= 0; i--) {
            if (this.hands[i][constants_json_1.default.GET]) {
                coef = this.hands[i][constants_json_1.default.COEF];
                mult = 1 + this.hands[i][constants_json_1.default.VALUE] / 70;
                break;
            }
        }
        var nb_cards = this.cards.length - this.nb_as;
        switch (i) {
            case constants_json_1.default.CARTE:
                if (nb_cards <= 2) {
                    coef = 0.05;
                }
                if (nb_cards == 3) {
                    coef = 0;
                    if (this.max_color >= 3 || this.max_suite >= 3) {
                        coef = 0.1;
                    }
                }
                if (nb_cards == 4) {
                    coef = 0;
                    if (this.max_color >= 3 || this.max_suite >= 3) {
                        coef = 0.1;
                    }
                    if (this.max_color >= 4 || this.max_suite >= 4) {
                        coef = 0.2;
                    }
                }
                if (nb_cards == 5) {
                    coef = 0;
                    if (this.max_color >= 4 || this.max_suite >= 4) {
                        coef = 0.15;
                    }
                }
                if (nb_cards == 6) {
                    coef = 0;
                    if (this.max_color >= 4 || this.max_suite >= 4) {
                        coef = 0.1;
                    }
                }
                if (nb_cards >= 7) {
                    coef = 0;
                }
                break;
            case constants_json_1.default.PAIRE:
                if (nb_cards == 2) {
                    coef = 0.15;
                }
                if (nb_cards == 3) {
                    coef = 0.1;
                    if (this.max_color >= 3 || this.max_suite >= 3) {
                        coef = 0.1;
                    }
                }
                if (nb_cards == 4) {
                    coef = 0.07;
                    if (this.max_color >= 3 || this.max_suite >= 3) {
                        coef = 0.1;
                    }
                    if (this.max_color >= 4 || this.max_suite >= 4) {
                        coef = 0.2;
                    }
                }
                if (nb_cards == 5) {
                    coef = 0.05;
                    if (this.max_color >= 3 || this.max_suite >= 3) {
                        coef = 0.1;
                    }
                    if (this.max_color >= 4 || this.max_suite >= 4) {
                        coef = 0.2;
                    }
                }
                if (nb_cards == 6) {
                    coef = 0;
                    if (this.max_color >= 4 || this.max_suite >= 4) {
                        coef = 0.1;
                    }
                }
                if (nb_cards >= 7) {
                    coef = 0;
                }
                break;
            case constants_json_1.default.D_PAIRE:
                if (nb_cards == 4) {
                    coef = 0.2;
                }
                if (nb_cards == 5) {
                    coef = 0.17;
                }
                if (nb_cards == 6) {
                    coef = 0.15;
                }
                if (nb_cards >= 7) {
                    coef = 0.1;
                }
                break;
            case constants_json_1.default.BRELAN:
                if (nb_cards == 3) {
                    coef = 0.5;
                }
                if (nb_cards == 4) {
                    coef = 0.4;
                }
                if (nb_cards == 5) {
                    coef = 0.2;
                }
                if (nb_cards == 6) {
                    coef = 0.2;
                }
                if (nb_cards >= 7) {
                    coef = 0.15;
                }
                break;
            case constants_json_1.default.QUINTE:
            case constants_json_1.default.COULEUR:
                if (nb_cards == 5) {
                    coef = 1;
                }
                if (nb_cards == 6) {
                    coef = 0.8;
                }
                if (nb_cards >= 7) {
                    coef = 0.5;
                }
                break;
            case constants_json_1.default.FULL:
                if (nb_cards == 5) {
                    coef = 1;
                }
                if (nb_cards == 6) {
                    coef = 1;
                }
                if (nb_cards >= 7) {
                    coef = 0.8;
                }
                break;
            case constants_json_1.default.CARRE:
            case constants_json_1.default.QUINTE_F:
            case constants_json_1.default.QUINTE_R:
                break;
            default:
                break;
        }
        this.coef = coef * mult;
        this.log("coef: " + coef + " * " + mult + " = " + this.coef);
    }
};
//# sourceMappingURL=index.js.map