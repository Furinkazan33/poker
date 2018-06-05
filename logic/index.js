var logic = function(config) {

    /* Load default configuration file */
    if(!config) { var config = require ('./config.json'); }

    this.getConfig = (cb) => cb(config)
    this.testa = (a, cb) => cb(a)


    this.switch = function(message) {

        switch (message.id) {

            /* Début de la partie */
            case "server.game.start":
            var player = message.data.info
            var players = message.data.count
                
            break;
        
            /* Réception des cartes */
            case "server.game.cards":
            var cards = message.data.cards

            break;

            /* Une nouvelle main commence */
            case "server.game.hand.start":
            // sorted by turn
            var players = message.data.players

            break;


            /* le joueur doit indiquer son coup */
            case "server.game.play":

            break;


            /* le joueur a mis trop de temps avant de répondre */
            case "server.game.play.timeout":

            break;


            /* coup valide et pris en compte */
            case "server.game.play.success":

            break;


            /* coup non valide et pas pris en compte */
            case "server.game.play.failure":

            break;


            /* Transmis aux autres joueurs suite à un coup valide */
            case "server.player.action":
            var player_id = message.data.id
            var action = message.data.action

            break;


            /* Nouvelles cartes ajoutées sur le tapis */
            case "server.game.board.cards":
            var cards = message.data.cards

            break;


            /* Une main se termine */
            case "server.game.hand.end":

            break;


            /* Fin de la partie */
            case "server.game.end":
            var winner = message.data.winner

            break;


            default:
                break;
        }
    }



    /*
        BET 0 => check
        BET = => call
        BET > => raise
    */
    this.action = {
        check: function(type) { return { type: "BET", "value": 0 } },
        
        call: function(type, value) { return { type: "BET", "value": value } },
        
        raise: function(type, value) { return { type: "BET", "value": value } },

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



    /* logic module */
    return this
}


module.exports = logic;