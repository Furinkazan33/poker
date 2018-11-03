module.exports = function(config) {

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
            },
            dealer: null,       // id du donneur
            blind: { 
                small: 0,       // Valeur de la blind
                big: 0          // Valeur de la blind
            }
        }
    
        this.player = {
            id: null,           // id du joueur
            chips: 0,           // tapis du joueur
            cards: [],          // liste des cartes dans la main
            blind: { 
                small: false,   // le joueur doit jouer la blind ?
                big: false      // le joueur doit jouer la blind ?
            }, 
        }
    
        
        // Formatage du message à envoyer au serveur
        play = (value) => ('{ "id": "client.game.player.play", "data": { "value": "'+value+'" } }')
        
        // Les actions possibles du joueur
        action = {}
        //action.blind_small = () => play(this.game.blind.small)
        //action.blind_big = () => play(this.game.blind.big)
        action.check = () => play(0)
        action.call = () => play(parseInt(this.last_value))
        action.raise = (value) => play(parseInt(this.last_value) + value)
        action.fold = () => play(0)
        
    
        var reponse = ((message) => {
            log("server", message)
            
            switch(message.id) {
                case 'server.lobby.join.success':
                    //log("info", config.name + " a rejoint la partie")
                    break

                case 'server.lobby.join.failure':
                    //log("info", config.name + " rejet. Raison : " + message.data.reason)
                    break

                case 'server.game.start':
                    //log("info", "Début de la partie")
                    //log("info", message.data.info)
                    //log("info", message.data.count + " joueurs")
                    
                    this.player.id = message.data.info.id
                    this.player.chips = message.data.info.chips
                    this.game.nbPlayers = message.data.count
                    this.game.hand.id = 0
                    log("info", "ID du joueur : " + this.player.id)
                    break
    
                case 'server.game.player.cards':
                    //log("info", "Réception des cartes")
                    //log("info", message.data.cards)
                    this.player.cards = message.data.cards
                    break
        
                case 'server.game.hand.start':
                    this.game.hand.id++
                    this.game.hand.turn = 0
                    log("info", "Une nouvelle main commence : " + this.game.hand.id)
                    //log("info", "Liste des joueurs : ")
                    //log("info", message.data.players)
                    //log("info", "Dealer : " + message.data.dealer)
                    // sorted by turn
                    this.game.players = message.data.players
                    this.game.dealer = message.data.dealer

                    // Récupération de la valeur du tapis du joueur
                    this.game.players.forEach(p => {
                        if(p.id == this.player.id){
                            this.player.chips = p.chips
                        }
                    });
                    
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
                    
                    //TODO: 
                    if (this.player.chips < 500) {
                        my_action = action.call()
                    }
                    else {
                        my_action = action.raise(100)
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

                    break

                
                case 'server.game.player.action':
                    //log("info", "Coup valide du joueur " + message.data.id + ", mise : " + message.data.value)
                    this.last_value = message.data.value
                    
                    break

                case 'server.game.board.cards':
                    //log("info", "Nouvelles cartes ajoutées sur le tapis")
                    //log(message.data.cards)
                    this.player.cards = this.player.cards.concat(message.data.cards)
                    //log("info", "Cartes du joueur")
                    //log(this.player.cards)
                    break

                case 'server.game.hand.end':
                    //log("info", "Une main se termine")
                    
                    break


                case 'server.game.end':
                    //log("info", "Fin de la partie. Gagnant : ")
                    //log("info", message.data.winner)
                    //this.winner = message.data.winner
                    break
                    
                default:
                    log("info", 'Erreur du serveur')
                    break
            }
        }).bind(this)
        
        
        socket.on('data', (function(message_brut) {





            //log("server", message_brut.toString())
            //messages = JSON.parse(message_brut)
            
            
            decoup(message_brut.toString(), (function(messages) {

                messages.forEach(((message) => reponse(message)).bind(this))

            }).bind(this), [])

        }).bind(this))
    })


    /* module */
    return this
}

