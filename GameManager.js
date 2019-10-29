const Game = require('./Game').Game;
const gameStates = require('./Game').gameStates;

class GameManager {
    constructor() {
        // map of game ids to 'unregistered' or 'active' game objects
        this.games = {};
    }

    __generateGameId() {
        return (Object.keys(this.games).length + 1).toString();
    }

    // only returns games that are unregistered or active
    // finished games between the provided players can be accessed by getGameByGameId()
    __getGameByPlayerIds(player1Id, player2Id) {
        for (let [gameId, game] of Object.entries(this.games)) {
            if (game.getPlayer1Id() == player1Id && 
                game.getPlayer2Id() == player2Id &&
                game.getState() != gameStates.FINISHED)
                return game;
        }
        return null;     
    }

    getGameByGameId(gameId) {
        const game = this.games[gameId];
        if (game) return game;
        return null;
    }

    registerGame(player1Id, player2Id) {
        let game = this.__getGameByPlayerIds(player1Id, player2Id);
        if (game && game.getState() == gameStates.UNREGISTERED)
            game.setState(gameStates.ACTIVE);
        else {
            const gameId = this.__generateGameId();
            game = new Game(gameId, player1Id, player2Id);
            this.games[gameId] = game;
        }
        return game;
    }
}

module.exports = GameManager;