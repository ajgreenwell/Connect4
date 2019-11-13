const router = require('express').Router();
const { GameModel, boardWidth, gameStates } = require('../../models/GameModel');

// Useful functions / handlers

const getRandomElement = arr => {
    return arr[Math.floor(Math.random() * arr.length)];
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
       .json({ msg: "Error, either the game is already finished or it is not your turn." });
}

// Routes, which extend from /api/games

router.get('/:gameId', (req, res) => {
    const gameId = req.params.gameId;
    GameModel.findById(gameId).exec((err, game) => {
        if (err)        handleInternalServerError(res, err);
        else if (!game) handleInvalidGameId(res, gameId);
        else            res.json(game);
    });
});

// need to add error handling for invalid playerIds, which may involve storing
// a collection of playerModels and checking if these ids exist in that collection
router.post('/create/:player1Id/:player2Id', (req, res) => {
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
            game.setNextToMove(getRandomElement(game.getPlayerIds()));
        }
        else game = new GameModel({ player1Id, player2Id });

        game.save()
            .then(game => res.json(game))
            .catch(err => handleInternalServerError(res, err));
    });
});

// need to decouple error messages from GameModel.js module, 
// perhaps by having game.makeMove() return different error objects?
router.put('/:gameId/move/:playerId/:colNumber', (req, res) => {
    const { gameId, playerId, colNumber } = req.params;
    GameModel.findById(gameId).exec((err, game) => {
        if (err)
            handleInternalServerError(res, err);
        else if (!game)
            handleInvalidGameId(res, gameId);
        else if (game.getPlayerIds().indexOf(playerId) == -1)
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

router.put('/:gameId/forfeit/:playerId', (req, res) => {
    const { gameId, playerId } = req.params;
    GameModel.findById(gameId).exec((err, game) => {
        if (err)
            handleInternalServerError(res, err);
        else if (!game)
            handleInvalidGameId(res, gameId);
        else if (game.getPlayerIds().indexOf(playerId) == -1)
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

module.exports = router;