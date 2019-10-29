const express = require('express');
const GameManager = require('./GameManager');
const boardWidth = require('./Game').boardWidth;

const app = express();
const manager = new GameManager();

app.use(express.json());

const createGameResponseBody = (game) => {
    resBody            = {}
    resBody.gameId     = game.getGameId();
    resBody.state      = game.getState();
    resBody.player1Id  = game.getPlayer1Id();
    resBody.player2Id  = game.getPlayer2Id();
    resBody.winnerId   = game.getWinnerId();
    resBody.nextToMove = game.getNextToMove();
    resBody.board      = game.getBoard();
    return resBody;
};

app.get('/games/:gameId', (req, res) => {
    const game = manager.getGameByGameId(req.params.gameId);
    if (!game) res.status(404).json({ msg: "Error, game does not exist" });
    else       res.json(createGameResponseBody(game));    
});

app.post('/games/create/:player1Id/:player2Id', (req, res) => {
    const game = manager.registerGame(req.params.player1Id, req.params.player2Id);
    res.json(createGameResponseBody(game));
});

app.put('/games/:gameId/move/:playerId/:colNumber', (req, res) => {
    let game = manager.getGameByGameId(req.params.gameId)
    if (!game)
        return res.status(400).json({ msg: "Must provide a valid game id" });
    game = game.makeMove(req.params.playerId, req.params.colNumber);
    if (!game)  {
        const msg = `colNumber must be an integer from 1 - ${boardWidth}, ` +
                    `column must not be full, the game must be active, ` +
                    `and it must be your turn`;
        res.status(400).json({ msg });
    } else 
        res.json(createGameResponseBody(game));
});

// need to decouple error messages from Game.js module, 
// perhaps by having game.forfeit() return different error objects
app.put('/games/:gameId/forfeit/:playerId', (req, res) => {
    let game = manager.getGameByGameId(req.params.gameId)
    if (!game)
        return res.status(400).json({ msg: "Must provide a valid game id" });
    game = game.forfeit(req.params.playerId);
    if (game) res.json(createGameResponseBody(game));
    else {
        const msg = "the game must be active";
        res.status(400).json({ msg });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));