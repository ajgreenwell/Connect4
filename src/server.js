const express = require('express');
const mongoose = require('mongoose');
const db = require("../config/keys").mongoURI;
const { GameModel, boardWidth, gameStates } = require('./GameModel');

const app = express();
app.use(express.json());

mongoose.connect(db, { useUnifiedTopology: true, useNewUrlParser: true })
        .then(() => console.log("MongoDB connected..."))
        .catch(err => console.log(err));

const getRandomElement = arr => {
    return arr[Math.floor(Math.random() * arr.length)]
}

const handleInternalServerError = (res, err) => {
    res.status(500).json({ 
        msg: "Internal server error, database may have failed.",
        error: err
    });
}

const handleInvalidGameId = (res, gameId) => {
    res.status(404)
       .json({ msg: `Error, the provided gameId (${gameId}) does not exist.` });
}

const handleInvalidMove = (res, colNumber) => {
    const msg = `Error, the provided column number was ${colNumber}, ` +
                `which must be an integer from 1 - ${boardWidth}, ` +
                `and this column must not be full. In order to make a valid move, ` +
                `the game must be also active and it must be your turn.`;
    res.status(400).json({ msg });
}

const handleInvalidPlayerId = (res, playerId) => {
    res.status(400)
       .json({ msg: `Error, the provided playerId (${playerId}) is invalid.`});
}

const handleInvalidForfeit = (res) => {
    res.status(400)
       .json({ msg: "Error, either the game is already finished or it is not your turn." })
}

// Routes

app.get('/games/:gameId', (req, res) => {
    const gameId = req.params.gameId;
    GameModel.findById(gameId).exec((err, game) => {
        if (err)        handleInternalServerError(res, err);
        else if (!game) handleInvalidGameId(res, gameId);
        else            res.json(game);
    });
});

// need to add error handling for invalid playerIds, which may involve storing
// a collection of playerModels and checking if these ids exist in that collection
app.post('/games/create/:player1Id/:player2Id', (req, res) => {
    const { player1Id, player2Id } = req.params;
    GameModel.find().exec((err, games) => {
        if (err) {
            handleInternalServerError(res, err);
            return;
        }
        game = null;
        games.forEach(existingGame => {
            if (existingGame.getPlayer1Id() == player1Id && 
                existingGame.getPlayer2Id() == player2Id &&
                existingGame.getState() != gameStates.FINISHED)
                game = existingGame;
        });
        if (game && game.getState() == gameStates.UNREGISTERED) {
            game.setState(gameStates.ACTIVE);
            game.setNextToMove(getRandomElement([player1Id, player2Id]));
        }
        else game = new GameModel({ player1Id, player2Id });

        game.save()
            .then(game => res.json(game))
            .catch(err => handleInternalServerError(res, err));
    });
});

// need to decouple error messages from GameModel.js module, 
// perhaps by having game.makeMove() return different error objects?
app.put('/games/:gameId/move/:playerId/:colNumber', (req, res) => {
    const { gameId, playerId, colNumber } = req.params;
    GameModel.findById(gameId).exec((err, game) => {
        if (err)
            handleInternalServerError(res, err);
        else if (!game)
            handleInvalidGameId(res, gameId);
        else if (Object.values(game.getPlayerIds()).indexOf(playerId) == -1)
            handleInvalidPlayerId(res, playerId);
        else {
            game = game.makeMove(playerId, colNumber);
            if (!game) handleInvalidMove(res, colNumber);
            else {
                game.markModified('board');
                game.save()
                    .then(game => res.json(game))
                    .catch(err => handleInternalServerError(res, err)); 
            }
        }
    });
});

app.put('/games/:gameId/forfeit/:playerId', (req, res) => {
    const { gameId, playerId } = req.params;
    GameModel.findById(gameId).exec((err, game) => {
        if (err)
            handleInternalServerError(res, err);
        else if (!game)
            handleInvalidGameId(res, gameId);
        else if (Object.values(game.getPlayerIds()).indexOf(playerId) == -1)
            handleInvalidPlayerId(res, playerId);
        else {
            game = game.forfeit(playerId);
            if (!game) handleInvalidForfeit(res);
            else {
                game.save()
                    .then(game => res.json(game))
                    .catch(err => handleInternalServerError(res, err)); 
            }
        }
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));