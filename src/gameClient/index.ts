'use strict'

var net = require("net")

import { cards, rawCard } from '../cards/index'
import default_config from './config.json'
import MESSAGE from './messages.json'

interface config {
    debug: boolean,
    name: string,
    aggressivite: number,
    localport: number,
    host: string, 
    port: number
}

interface jsonGame {
    players: serverPlayer []
    nbPlayers: number
    hand: { 
        id: number
        turn: number
        allin: boolean
    }
    dealer: number
    mise_en_cours: number
    blind: { 
        small: number
        big: number
    }
}

type ACTIVE = "0"
interface serverPlayer {
    id: number,
    name: string,
    chips: number,
    state: ACTIVE | "FOLDED" | "ELIMINATED"
}

interface jsonPlayer {
    id: number
    chips: number
    mise_en_cours: number
    coef: number
    aggressivite: number
}

type logType = "server" | "player" | "info"
type actionType = "mise" | "aligne" | "couche" | "tapis"
type messageClient = string

type messageServerId = string
interface messageServer {
    id: messageServerId
    data: any
}

// Bidouille de Kevin
const ERROR_REGEX = /^Unexpected token { in JSON at position (\d+)$/;
function decoup(message_brut: string, cb: Function) {
    //console.log(message_brut)
    jsonMultiParse(message_brut, [], function(messages) {
        cb(messages)
    })
}

function jsonMultiParse(input: string, acc, cb) {
    if (input.trim().length === 0) {
        return cb(acc);
    }
    try {
        acc.push(JSON.parse(input));
        return cb(acc);
    }
    catch (error) {
        const match = error.message.match(ERROR_REGEX);
        if (!match) {
            throw error;
        }
        const index = parseInt(match[1], 10);
        acc.push(JSON.parse(input.substr(0, index)));
        return jsonMultiParse(input.substr(index), acc, cb);
    }
}

export interface game {
    config: config
    cards: cards
    socket
    game: jsonGame
    player: jsonPlayer

    connect(cb: Function): void
    init_game(): void
    init_player(): void
    new_game(player_id: number, player_chips: number, nbPlayers: number): void
    new_cards(new_cards: [rawCard]): void
    new_hand(players: serverPlayer [], dealer: number): void
    action(type: actionType, value?: number): messageClient
    play(): messageClient
    new_action(id: number, value: number) : void
    treat_server_message(message: messageServer): void
    start_playing(): void
}

export class Game implements game {
    config: config = default_config
    cards: cards = null
    socket = null
    game: jsonGame = null
    player: jsonPlayer = null

    constructor(cards, config?: config) {
        if(config) { this.config = config }

        this.cards = cards
    
        process.env.PORT = this.config.localport.toString()

        this.socket = new net.Socket()
    }

    _log(type: logType, message: string): void{ 
        if(this.config.debug){ 
            switch (type) {
                case "server":
                    console.log("SERVEUR : %j", message)
                    break
            
                case "player":
                    console.log(this.config.name + " : " + message)
                break
            
                case "info":
                    console.log("INFO : " + message)
                break

                default:
                    break
            }
            
        }
    }

    connect(cb: Function): void {
        this.socket.connect(this.config.port, this.config.host, (function() {
            this._log("info", this.config.name + " connected to server with port " + this.config.localport);  
        
            var message = '{ "id": "' + MESSAGE.CLIENT.JOIN + '", "data": { "name": "' + this.config.name + '" } }'
            this._log("player", message)
            this.socket.write(message)

            cb()
        }).bind(this))
    }

    init_game(): void {
        this.game = {
            players: [],        // liste des joueurs
            nbPlayers: 0,       // nombre de joueurs de la partie
            hand: { 
                id: 0,          // numéro de la main
                turn: 0,        // numéro du tour de la main
                allin: false,   // tapis en cours
            },
            dealer: null,       // id du donneur
            mise_en_cours: 0,   // Dernière mise des joueurs
            blind: { 
                small: 0,       // Valeur de la blind
                big: 0          // Valeur de la blind
            }
        }
    }

    init_player(): void {
        this.player = {
            id: null,           // id du joueur
            chips: 0,           // tapis du joueur
            mise_en_cours: 0,        // Mise en cours
            coef: 0.15,
            aggressivite: this.config.aggressivite,
        }
    }

    new_game(player_id: number, player_chips: number, nbPlayers: number): void {
        this.player.id = player_id
        this.player.chips = player_chips
        this.game.nbPlayers = nbPlayers
        this.game.hand.id = 0
        this.game.mise_en_cours = 0

        this._log("info", "ID du joueur : " + this.player.id)
    }

    new_cards(new_cards: [rawCard]): void {
        this.cards.add_cards(new_cards)
        this.cards.check_hand()
        this.player.coef = this.player.aggressivite * this.cards.coef
    }

    new_hand(players: serverPlayer [], dealer: number): void {
        this.cards.reset()
        this.game.hand.id++
        this.game.hand.turn = 0
        this.game.hand.allin = false
        this.game.mise_en_cours = 0
        this._log("info", "Une nouvelle main commence : " + this.game.hand.id)

        this.game.players = players
        this.game.dealer = dealer

        // Récupération de la valeur du tapis du joueur
        this.game.players.forEach(p => {
            this._log("info", p.id + " = " + this.player.id)
            if(p.id == this.player.id){
                this.player.chips = p.chips
                this._log("info", "Nouveau chips : " + this.player.chips)
            }
        })

        this.player.mise_en_cours = 0
    }
    
    // Formatage du message à envoyer au serveur
    _message_client_play(value: number): messageClient {
        this.player.mise_en_cours = value
        return '{ "id": "' + MESSAGE.CLIENT.PLAY + '", "data": { "value": ' + value + ' } }'
    }

    // Les actions possibles du joueur
    action(type: actionType, value?: number): messageClient {
        switch (type) {
            case "mise":
                var a_miser = this.game.mise_en_cours + value

                if(a_miser > this.player.chips) {
                    a_miser = this.player.chips
                }
                else if(a_miser < this.game.blind.big) {
                    a_miser = this.game.blind.big
                }
                else if(this.player.chips < this.game.blind.big || a_miser < this.game.mise_en_cours) {
                    a_miser = 0
                }
                return this._message_client_play(a_miser)        
        
            case "aligne":
                return this.action("mise", 0)

            case "couche":
                return this._message_client_play(0)

            case "tapis":
                if(this.game.hand.allin) {
                    return this.action("mise", 0)
                } 
                return this._message_client_play(this.player.chips) 

            default:
                throw Error
        }
    }

    play(): messageClient {
        var a_miser = this.player.coef * this.player.chips
        var reste_a_miser = a_miser - this.player.mise_en_cours

        console.log(a_miser + " " + this.player.mise_en_cours + " " + reste_a_miser)

        if(this.player.coef == 0) {
            return this.action("couche")
        }
        else if(this.player.coef >= 0.9) {
            if(this.game.hand.allin) {
                return this.action("tapis")
            }
            else if(reste_a_miser > 0.25 * a_miser) {
                return this.action("mise", 50)
            }
            else {
                return this.action("tapis")
            }
        }
        else {
            // On a la marge, on joue
            if(reste_a_miser > 0.5 * a_miser) {   
                return this.action("mise", 0.1 * reste_a_miser)
            }
            // On prends des précautions
            else {
                if(reste_a_miser > 0.25 * a_miser) {
                    return this.action("aligne")
                }

                // Tapis
                else {
                    return this.action("mise", reste_a_miser)
                }
            }
        }
    }

    new_action(id: number, value: number) : void {
        if(value > this.game.mise_en_cours) {
            this.game.mise_en_cours = value
        }
        if(!this.game.hand.allin) {
            this.game.players.forEach(player => {
                if(player.id == id) {
                    if(player.state != "0") { 
                        console.log("ERREUR DU SERVEUR : le joueur " + player.id + " est inactif !!!") 
                    }
                    player.chips -= value
                    if(player.chips <= 0) {
                        this.game.hand.allin = true
                    }
                }
            })
        }
    }

    treat_server_message(message: messageServer): void {
        this._log("server", message.toString())
        
        switch(message.id) {

            case MESSAGE.SERVER.GAME.START:
                this.new_game(message.data.info.id, message.data.info.chips, message.data.count)
                break

            case MESSAGE.SERVER.GAME.PLAYER.CARDS:
            case MESSAGE.SERVER.GAME.BOARD_CARDS:
                this.new_cards(message.data.cards)
                break
    
            case MESSAGE.SERVER.GAME.HAND.START:
                this.new_hand(message.data.players, message.data.dealer)                    
                break
            
            case MESSAGE.SERVER.GAME.BLIND_CHANGE:
                this.game.blind.small = message.data.small
                this.game.blind.big = message.data.big
                break

            case MESSAGE.SERVER.GAME.TURN.START:
                this.game.hand.turn++
                this._log("info", "Un nouveau tour commence : " + this.game.hand.turn)
                break

            case MESSAGE.SERVER.GAME.PLAYER.PLAY:
                var action = this.play()
                this._log("player", action)
                this.socket.write(action)
                break
            
            case MESSAGE.SERVER.GAME.PLAYER.PLAY_FAILURE:
                this.socket.write(this.action("aligne"))
                break

            case MESSAGE.SERVER.GAME.PLAYER.ACTION:
                this.new_action(message.data.id, message.data.value)
                break

            case MESSAGE.SERVER.LOBBY.JOIN.SUCCESS:
            case MESSAGE.SERVER.LOBBY.JOIN.FAILURE:
            case MESSAGE.SERVER.GAME.TURN.END:
            case MESSAGE.SERVER.GAME.PLAYER.PLAY_TIMEOUT:
            case MESSAGE.SERVER.GAME.PLAYER.PLAY_SUCCESS:
            case MESSAGE.SERVER.GAME.HAND.END:
            case MESSAGE.SERVER.GAME.END:
                break
                
            default:
                this._log("info", 'Erreur du serveur')
                break
        }
    }

    start_playing(): void {
        this.init_game()
        this.init_player()

        this.socket.on('data', (function(message_brut) {
            
            decoup(message_brut.toString(), (function(messages) {

                messages.forEach(((message) => this.treat_server_message(message)).bind(this))

            }).bind(this))

        }).bind(this))
    }
}
