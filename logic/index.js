var logic = function(config) {

    /* Load default configuration file */
    if(!config) { var config = require ('./config.json'); }


        /* Début de la partie */
        socket.on("server.game.start", function(message) {
            this.player = message.data.info
            this.nbPlayers = message.data.count
        })
    
        /* Réception des cartes */
        socket.on("server.game.cards", function(message) {
            this.myCards = message.data.cards
        })
        

        /* Une nouvelle main commence */
        socket.on("server.game.hand.start", function(message) {
            // sorted by turn
            this.players = message.data.players

        })


        /* le joueur doit indiquer son coup */
        socket.on("server.game.play", function(message) {

        })


        /* le joueur a mis trop de temps avant de répondre */
        socket.on("server.game.play.timeout", function(message) {

        })


        /* coup valide et pris en compte */
        socket.on("server.game.play.success", function(message) {

        })


        /* coup non valide et pas pris en compte */
        socket.on("server.game.play.failure", function(message) {

        })


        /* Transmis aux autres joueurs suite à un coup valide */
        socket.on("server.player.action", function(message) {
            this.player_id = message.data.id
            this.action = message.data.action

        })


        /* Nouvelles cartes ajoutées sur le tapis */
        socket.on("server.game.board.cards", function(message) {
            this.cards = message.data.cards

        })


        /* Une main se termine */
        socket.on("server.game.hand.end", function(message) {

        })


        /* Fin de la partie */
        socket.on("server.game.end", function(message) {
            this.winner = message.data.winner

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



    /* logic module */
    return this
}


export default logic;