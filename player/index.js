module.exports = Player



function Player(cards, config) {

    /* Load default configuration file */
    if(!config) { var config = require ('./config.json'); }
    
    process.env.PORT = config.localport


    var net = require("net")
    var socket = new net.Socket()
 
    
    function log(type, message){ 
        if(config.debug){ 
            switch (type) {
                case "server":
                    console.log("SERVEUR : %j", message)
                    break;
            
                case "player":
                    console.log(config.name + " : " + message)
                break;
            
                case "info":
                    console.log("INFO : " + message)
                break;

                default:
                    break;
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
        
        var message = '{ "id": "client.lobby.join", "data": { "name": "' + config.name + '" } }'
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
            coef: 0.15,               // ce que je suis prêt à miser
        }
    
        
        // Formatage du message à envoyer au serveur
        this._play = (value) => {
            this.player.mise_en_cours = parseInt(value)
            return '{ "id": "client.game.player.play", "data": { "value": ' + parseInt(value) + ' } }'
        }
        // Les actions possibles du joueur
        this.action = {}
        this.action.mise = (value) => {
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
                return this.mise(0)
            } 
            return this._play(this.player.chips) 
        }
        
    
        var reponse = ((message) => {
            log("server", message)
            
            switch(message.id) {
                case 'server.lobby.join.success':
                    break

                case 'server.lobby.join.failure':
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
                    this.player.coef = cards.check_hand()
                    break
        
                case 'server.game.hand.start':
                    cards.reset()
                    console.log("reset")
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
                            my_action = this.action.mise(100)
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
                    log(this.player.coef)
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
                    this.player.coef = cards.check_hand()

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

