'use strict'

var net = require("net")

import default_config from './config.json'
import MESSAGE from './messages.json'

// Bidouille de Kevin
const ERROR_REGEX = /^Unexpected token { in JSON at position (\d+)$/;
function decoup(message_brut, cb) {
    //console.log(message_brut)
    jsonMultiParse(message_brut, [], function(messages) {
        cb(messages)
    })
}

function jsonMultiParse(input, acc, cb) {
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

module.exports = class Player {
    config = default_config
    cards = null
    socket = null
    game = null
    player = null

    constructor(cards, config?) {
        if(config) { this.config = config }

        this.cards = cards
    
        process.env.PORT = this.config.localport.toString()

        this.socket = new net.Socket()
    }

    log(type, message){ 
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

    connect(cb) {
        this.socket.connect(this.config.port, this.config.host, (function() {
            this.log("info", this.config.name + " connected to server with port " + this.config.localport);  
        
            var message = '{ "id": "' + MESSAGE.CLIENT.JOIN + '", "data": { "name": "' + this.config.name + '" } }'
            this.log("player", message)
            this.socket.write(message)

            cb()
        }).bind(this))
    }

    init_game() {
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

    init_player() {
        this.player = {
            id: null,           // id du joueur
            chips: 0,           // tapis du joueur
            mise_en_cours: 0,        // Mise en cours
            coef: 0.15,
            aggressivite: this.config.aggressivite,
        }
    }

    new_game(player_id, player_chips, nbPlayers) {
        this.player.id = player_id
        this.player.chips = player_chips
        this.game.nbPlayers = nbPlayers
        this.game.hand.id = 0
        this.game.mise_en_cours = 0

        this.log("info", "ID du joueur : " + this.player.id)
    }

    new_cards(new_cards) {
        this.cards.add_cards(new_cards)
        this.cards.check_hand()
        this.player.coef = this.player.aggressivite * this.cards.coef
    }

    new_hand(players, dealer) {
        this.cards.reset()
        this.game.hand.id++
        this.game.hand.turn = 0
        this.game.hand.allin = false
        this.game.mise_en_cours = 0
        this.log("info", "Une nouvelle main commence : " + this.game.hand.id)

        this.game.players = players
        this.game.dealer = dealer

        // Récupération de la valeur du tapis du joueur
        this.game.players.forEach(p => {
            this.log("info", p.id + " = " + this.player.id)
            if(p.id == this.player.id){
                this.player.chips = p.chips
                this.log("info", "Nouveau chips : " + this.player.chips)
            }
        })

        this.player.mise_en_cours = 0
    }
    
    // Formatage du message à envoyer au serveur
    _message_client_play(value) {
        this.player.mise_en_cours = parseInt(value)
        return '{ "id": "' + MESSAGE.CLIENT.PLAY + '", "data": { "value": ' + parseInt(value) + ' } }'
    }

    // Les actions possibles du joueur
    action(type, value?) {
        switch (type) {
            case "mise":
                var a_miser = parseInt(this.game.mise_en_cours) + value

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

    play() {
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

    new_action(id, value) {
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

    treat_server_message(message) {
        this.log("server", message)
        
        switch(message.id) {
            case MESSAGE.SERVER.LOBBY.JOIN.SUCCESS:
                break

            case MESSAGE.SERVER.LOBBY.JOIN.FAILURE:
                break

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
            
            // Pas dans la spec
            case MESSAGE.SERVER.GAME.BLIND_CHANGE:
                //this.log("info", "Nouvelle blind : " + message.data.small + " / " + message.data.big)
                this.game.blind.small = message.data.small
                this.game.blind.big = message.data.big
                break

            case MESSAGE.SERVER.GAME.TURN.START:
                this.game.hand.turn++
                this.log("info", "Un nouveau tour commence : " + this.game.hand.turn)
                break

            case MESSAGE.SERVER.GAME.TURN.END:
                //this.log("info", "Le tour se termine")
                break

            case MESSAGE.SERVER.GAME.PLAYER.PLAY:
                var action = this.play()
                this.log("player", action)
                this.socket.write(action)
                break
            
            case MESSAGE.SERVER.GAME.PLAYER.PLAY_TIMEOUT:
                //this.log("info", "Le joueur a mis trop de temps avant de répondre")

                break


            case MESSAGE.SERVER.GAME.PLAYER.PLAY_SUCCESS:
                //this.log("info", "Coup valide et pris en compte")

                break

            
            case MESSAGE.SERVER.GAME.PLAYER.PLAY_FAILURE:
                //this.log("info", "Coup non valide et pas pris en compte")
                this.socket.write(action("mise", 0))

                break

            
            case MESSAGE.SERVER.GAME.PLAYER.ACTION:
                this.new_action(message.data.id, message.data.value)
                break

            case MESSAGE.SERVER.GAME.HAND.END:
                //this.log("info", "Une main se termine")
                break


            case MESSAGE.SERVER.GAME.END:
                //this.log("info", "Fin de la partie. Gagnant : ")
                //this.log("info", message.data.winner)
                break
                
            default:
                this.log("info", 'Erreur du serveur')
                break
        }
    }

    start_playing() {
        this.init_game()
        this.init_player()

        this.socket.on('data', (function(message_brut) {
            
            decoup(message_brut.toString(), (function(messages) {

                messages.forEach(((message) => this.treat_server_message(message)).bind(this))

            }).bind(this))

        }).bind(this))
    }
}


/*
function Player(cards, config) {

    if(!config) { var config = require ('./config.json'); }
    
    process.env.PORT = config.localport


    var net = require("net")
    var socket = new net.Socket()
 
    
    function this.(type, message){ 
        if(config.debug){ 
            switch (type) {
                case "server":
                    console.log("SERVEUR : %j", message)
                    break
            
                case "player":
                    console.log(config.name + " : " + message)
                break
            
                case "info":
                    console.log("INFO : " + message)
                break

                default:
                    break
            }
            
        }
    }

    // Bidouille de Kevin
    const ERROR_REGEX = /^Unexpected token { in JSON at position (\d+)$/;
    function decoup(message_brut, cb) {
        //console.log(message_brut)
        jsonMultiParse(message_brut, [], function(messages) {
            cb(messages)
        })
    }
    function jsonMultiParse(input, acc, cb) {
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


    socket.connect(config.port, config.host, function() {
        log("info", config.name + " connected to server with port " + config.localport);  
        
        var message = '{ "id": "client.LOBBY.JOIN"FAILURE"data": { "name": "' + config.name + '" } }'
        log("player", message)
        socket.write(message)


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
    
        this.player = {
            id: null,           // id du joueur
            chips: 0,           // tapis du joueur
            mise_en_cours: 0,        // Mise en cours
            coef: 0.15,
            aggressivite: config.aggressivite,
        }
    
        
        // Formatage du message à envoyer au serveur
        this._play = (value) => {
            this.player.mise_en_cours = parseInt(value)
            return '{ "id": "client.game.player.play", "data": { "value": ' + parseInt(value) + ' } }'
        }
        // Les actions possibles du joueur
        this.action = this.("mise", = (value) => {
            var a_miser = parseInt(this.game.mise_en_cours) + value

            if(a_miser > this.player.chips) {
                a_miser = this.player.chips
            }
            else if(a_miser < this.game.blind.big) {
                a_miser = this.game.blind.big
            }
            else if(this.player.chips < this.game.blind.big || a_miser < this.game.mise_en_cours) {
                a_miser = 0
            }
            return this._play(a_miser)
        }
        this.action.aligne = () => {
            return this.action.mise(0) 
        }
        this.action.couche = () => { 
            return this._play(0)
        }
        this.action.tapis = () => {
            if(this.game.hand.allin) {
                return this.action.mise(0)
            } 
            return this._play(this.player.chips) 
        }
        
    
        var reponse = ((message) => {
            log("server", message)
            
            switch(message.id) {
                case 'server.LOBBY.JOIN.FAILURE:
                    break

                case 'server.LOBBY.JOIN.FAILURE:
                    break

                case 'server.game.start':
                    this.player.id = message.data.info.id
                    this.player.chips = message.data.info.chips
                    this.game.nbPlayers = message.data.count
                    this.game.hand.id = 0
                    this.game.mise_en_cours = 0
                    log("info", "ID du joueur : " + this.player.id)
                    break
    
                case 'server.game.player.cards':
                    //cards = new Cards()
                    cards.add_cards(message.data.cards)
                    cards.check_hand()
                    this.player.coef = this.player.aggressivite * cards.coef
                    break
        
                case 'server.game.hand.start':
                    cards.reset()
                    this.game.hand.id++
                    this.game.hand.turn = 0
                    this.game.hand.allin = false
                    this.game.mise_en_cours = 0
                    log("info", "Une nouvelle main commence : " + this.game.hand.id)
                    //log("info", message.data.players)
                    // sorted by turn
                    this.game.players = message.data.players
                    this.game.dealer = message.data.dealer

                    // Récupération de la valeur du tapis du joueur
                    this.game.players.forEach(p => {
                        log("info", p.id + " = " + this.player.id)
                        if(p.id == this.player.id){
                            this.player.chips = p.chips
                            log("info", "Nouveau chips : " + this.player.chips)
                        }
                    });

                    this.player.mise_en_cours = 0
                    
                    break
                
                // Pas dans la spec
                case 'server.game.blind.change':
                    //log("info", "Nouvelle blind : " + message.data.small + " / " + message.data.big)
                    this.game.blind.small = message.data.small
                    this.game.blind.big = message.data.big
                    break

                case 'server.game.turn.start':
                    this.game.hand.turn++
                    log("info", "Un nouveau tour commence : " + this.game.hand.turn)
                    break

                case 'server.game.turn.end':
                    //log("info", "Le tour se termine")
                    break

                case 'server.game.player.play':
                    //log("info", "Le joueur doit indiquer son coup")
                    var my_action = ""
                    var a_miser = this.player.coef * this.player.chips
                    var reste_a_miser = a_miser - this.player.mise_en_cours

                    console.log(a_miser + " " + this.player.mise_en_cours + " " + reste_a_miser)
                    
                    if(this.player.coef == 0) {
                        my_action = this.action.couche()
                    }
                    else if(this.player.coef >= 0.9) {
                        if(this.game.hand.allin) {
                            my_action = this.action.tapis()
                        }
                        else if(reste_a_miser > 0.25 * a_miser) {
                            my_action = this.action.mise(50)
                        }
                        else {
                            my_action = this.action.tapis()
                        }
                    }
                    else {
                        // On a la marge, on joue
                        if(reste_a_miser > 0.5 * a_miser) {   
                            my_action = this.action.mise(0.1 * reste_a_miser)
                        }
                        // On prends des précautions
                        else {
                            if(reste_a_miser > 0.25 * a_miser) {
                                my_action = this.action.aligne()
                            }

                            // Tapis
                            else {
                                my_action = this.action.mise(reste_a_miser)
                            }
                        }
                    }
                    log("player", my_action)
                    socket.write(my_action)

                    break
                
                case 'server.game.player.play.timeout':
                    //log("info", "Le joueur a mis trop de temps avant de répondre")

                    break


                case 'server.game.player.play.success':
                    //log("info", "Coup valide et pris en compte")

                    break

                
                case 'server.game.player.play.failure':
                    //log("info", "Coup non valide et pas pris en compte")
                    socket.write(this.action.mise(0))

                    break

                
                case 'server.game.player.action':
                    //log("info", "Coup valide du joueur " + message.data.id + ", mise : " + message.data.value)
                    if(message.data.value > this.game.mise_en_cours) {
                        this.game.mise_en_cours = message.data.value
                    }
                    if(!this.game.hand.allin) {
                        this.game.players.forEach(p => {
                            if(p.id == message.data.id){
                                if(p.state != "0") { console.log("ERREUR DU SERVEUR : le joueur " + p.id + " est inactif !!!") }
                                p.chips -= message.data.value
                                if(p.chips <= 0) {
                                    this.game.hand.allin = true
                                }
                            }
                        })
                    }
                    
                    break

                case 'server.game.board.cards':
                    //log("info", "Nouvelles cartes ajoutées sur le tapis")
                    cards.add_cards(message.data.cards)
                    cards.check_hand()
                    this.player.coef = this.player.aggressivite * cards.coef
                    break

                case 'server.game.hand.end':
                    //log("info", "Une main se termine")
                    break


                case 'server.game.end':
                    //log("info", "Fin de la partie. Gagnant : ")
                    //log("info", message.data.winner)
                    break
                    
                default:
                    log("info", 'Erreur du serveur')
                    break
            }
        }).bind(this)
        
        
        socket.on('data', (function(message_brut) {            
            
            decoup(message_brut.toString(), (function(messages) {

                messages.forEach(((message) => reponse(message)).bind(this))

            }).bind(this), [])

        }).bind(this))
    })


}

*/