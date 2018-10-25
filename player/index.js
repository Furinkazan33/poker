module.exports = function(config) {

    /* Load default configuration file */
    if(!config) { var config = require ('./config.json'); }
    
    process.env.PORT = config.localport
    

    function log(message) {
        config.debug && console.log(config.name + "=>" + message)
    }
    
    var net = require("net")
    var socket = new net.Socket()
    
    socket.connect(config.port, config.host, function() {
        log(config.name + " connected to server with port " + config.localport);  
        
        socket.write('{ "id": "client.lobby.join", "data": { "name": "' + config.name + '" } }')

        socket.on('data', function(message) {
            log('Received: ' + message)

            message = JSON.parse(message)
                                
            switch(message.id) {
                case 'server.lobby.join.success':
                log(config.name + " a rejoint la partie")
                break

                case "server.game.start":
                    log("Début de la partie")
                    this.player = message.data.info
                    this.nbPlayers = message.data.count
                    break
    
                case "server.game.cards":
                    log("Réception des cartes")
                    this.myCards = message.data.cards
                    break
        
                case "server.game.hand.start":
                    log("Une nouvelle main commence")
                    // sorted by turn
                    this.players = message.data.players
                    break

                case "server.game.play":
                    log("Le joueur doit indiquer son coup")
                    //TODO: 
                    //socket.emit(this.message(this.action.))
                    break
                

                case "server.game.play.timeout":
                    log("Le joueur a mis trop de temps avant de répondre")

                    break


                case "server.game.play.success":
                    log("Coup valide et pris en compte")

                    break

                
                case "server.game.play.failure":
                    log("Coup non valide et pas pris en compte")

                    break

                
                case "server.player.action":
                    log("Transmis aux autres joueurs suite à un coup valide")
                    this.player_id = message.data.id
                    this.action = message.data.action
                    break

                case "server.game.board.cards":
                    log("Nouvelles cartes ajoutées sur le tapis")
                    this.cards = message.data.cards
                    break

                case "server.game.hand.end":
                    log("Une main se termine")
                    break


                case "server.game.end":
                    log("Fin de la partie")
                    this.winner = message.data.winner
                    break


                default:
                    log('Erreur du serveur')
                    break
            }
        })
    })


        




    /*
        BET 0 => check
        BET = => call
        BET > => raise
    */
    this.action = {
        check: function() { return { type: "BET", "value": 0 } },
        
        call: function(value) { return { type: "BET", "value": value } },
        
        raise: function(value) { return { type: "BET", "value": value } },

        fold: function() { return { type: "FOLD" } },
    }


    this.message = function(action) {
        return message = {
            id: "player.action",
            data: {
              action: action
            }
          }
    }



    /* module */
    return this
}

