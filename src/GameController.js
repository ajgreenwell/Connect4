const GameModel = require('./GameModel').GameModel;
const gameStates = require('./GameModel').gameStates;

class GameController {

    // only returns games that are unregistered or active
    // finished games between the provided players can be accessed by getGameByGameId()

    // runs asynchronously
    __getGameByPlayerIds(player1Id, player2Id) {
        GameModel.find().exec((err, games) => {
            games.forEach(game => {
                if (game.getPlayer1Id() == player1Id && 
                    game.getPlayer2Id() == player2Id &&
                    game.getState() != gameStates.FINISHED)
                    console.log(game);
                    return game;
            });
            return null;
        });
    }

    getGameByGameId(gameId) {
        const game = GameModel.findById(gameId)
                              .then(game => game)
                              .catch(err => console.log(err));
        if (game) return game;
        return null;
    }

    registerGame(player1Id, player2Id) {
        let game = this.__getGameByPlayerIds(player1Id, player2Id);
        // always logs 'undefined' because the above function call runs async
        console.log(game);
        if (game && game.getState() == gameStates.UNREGISTERED)
            game.setState(gameStates.ACTIVE);
        else
            game = new GameModel({ player1Id, player2Id });
        return game;
    }
}

module.exports = GameController;