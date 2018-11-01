module.exports = function(config) {

    /* Load default configuration file */
    if(!config) { var config = require ('./config.json'); }
    
    process.env.PORT = config.localport
 
    var net = require("net")
    var socket = new net.Socket()
    
    function log(message){ 
        if(config.debug){ 
            console.log(config.name)
            console.log(message)
        }
    }

    // Bidouille de Kevin
    const ERROR_REGEX = /^Unexpected token { in JSON at position (\d+)$/;
    function jsonMultiParse(input, acc = []) {
        if (input.trim().length === 0) {
            return acc;
        }
        try {
            acc.push(JSON.parse(input));
            return acc;
        }
        catch (error) {
            const match = error.message.match(ERROR_REGEX);
            if (!match) {
                throw error;
            }
            const index = parseInt(match[1], 10);
            acc.push(JSON.parse(input.substr(0, index)));
            return jsonMultiParse(input.substr(index), acc);
        }
    }


    socket.connect(config.port, config.host, function() {
        log(config.name + " connected to server with port " + config.localport);  
        
        socket.write('{ "id": "client.lobby.join", "data": { "name": "' + config.name + '" } }')


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
        play = (value) => ({ id: "client.game.player.play", data: { value: value } })
        
        // Les actions possibles du joueur
        action = {}
        action.blind_small = () => play(this.game.blind.small)
        action.blind_big = () => play(this.game.blind.big)
        action.check = () => play(0)
        action.call = () => play(this.last_value)
        action.raise = (value) => play(this.last_value + value)
        action.fold = () => play(0)
        
    
        
        
        
        socket.on('data', function(message_brut) {
            log('Received: ' + message_brut)
            //message = JSON.parse(message_brut)
            messages = jsonMultiParse(message_brut.toString())

            messages.forEach(message => {
                log(message)

                switch(message.id) {
                    case 'server.lobby.join.success':
                    log(config.name + " a rejoint la partie")
                    break
    
                    case 'server.lobby.join.failure':
                    log(config.name + " rejet. Raison : " + message.data.reason)
                    break;
    
                    case 'server.game.start':
                        log("Début de la partie")
                        log("Infos " + config.name + " : ")
                        log(message.data.info)
                        log(message.data.count + " joueurs")
                        this.player.id = message.data.info.id
                        this.player.chips = message.data.info.chips
                        this.game.nbPlayers = message.data.count
                        this.game.hand.id = 0
                        break
        
                    case 'server.game.player.cards':
                        log("Réception des cartes")
                        log(message.data.cards)
                        this.player.cards = message.data.cards
                        break
            
                    case 'server.game.hand.start':
                        this.game.hand.id++
                        this.game.hand.turn = 0
                        log("Une nouvelle main commence : " + this.game.hand.id)
                        log("Liste des joueurs : ")
                        log(message.data.players)
                        log("Dealer : " + message.data.dealer)
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
                        log("Nouvelle blind : " + message.data.small + " / " + message.data.big)
                        this.game.blind.small = message.data.small
                        this.game.blind.big = message.data.big
                        break

                    case 'server.game.turn.start':
                        this.game.hand.turn++
                        log("Un nouveau tour commence : " + this.game.hand.turn)
                        break

                    case 'server.game.turn.end':
                        log("Le tour se termine")
                        break
    
                    case 'server.game.player.play':
                        log("Le joueur doit indiquer son coup")
                        var my_action
    
                        if (this.game.hand.turn == 1 && this.player.id == this.game.players[0].id) {
                            my_action = action.blind_small()
                        }
                        else if(this.game.hand.turn == 1 && this.player.id == this.game.players[1].id) {
                            my_action = action.blind_big()
                        }
                        else {
                            //TODO: 
                            //if(config.CALL) {
                            //    my_action = action.call()
                            //}
                            if (this.player.chips < 500) {
                                my_action = action.call()
                            }
                            else {
                                my_action = action.raise(100)
                            }
                        }
    
                        log(my_action)
                        socket.emit(my_action)
    
                        break
                    
                    case 'server.game.player.play.timeout':
                        log("Le joueur a mis trop de temps avant de répondre")
    
                        break
    
    
                    case 'server.game.play.success':
                        log("Coup valide et pris en compte")
    
                        break
    
                    
                    case 'server.game.play.failure':
                        log("Coup non valide et pas pris en compte")
    
                        break
    
                    
                    case 'server.game.player.action':
                        log("Coup valide du joueur " + message.data.id + ", mise : " + message.data.value)
                        
                        
                        break
    
                    case 'server.game.board.cards':
                        log("Nouvelles cartes ajoutées sur le tapis")
                        log(message.data.cards)
                        this.player.cards = this.player.cards.concat(message.data.cards)
                        log("Cartes du joueur")
                        log(this.player.cards)
                        break
    
                    case 'server.game.hand.end':
                        log("Une main se termine")
                        
                        break
    
    
                    case 'server.game.end':
                        log("Fin de la partie. Gagnant : ")
                        log(message.data.winner)
                        //this.winner = message.data.winner
                        break
                        
                    default:
                        log('Erreur du serveur')
                        break
                }
                
            });
        })
    })


    /* module */
    return this
}

