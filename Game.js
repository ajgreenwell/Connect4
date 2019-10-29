const player1Token = "X";
const player2Token = "O";
const emptyToken = "-";
const boardWidth = 7;
const boardHeight = 6;
const gameStates = {
    UNREGISTERED: "unregistered",
    ACTIVE: "active",
    FINISHED: "finished"
};

class Game {

    constructor(gameId, player1Id, player2Id) {
        this.gameId = gameId;
        this.state = gameStates.UNREGISTERED;
        this.player1Id = player1Id;
        this.player2Id = player2Id;
        this.winnerId = null;
        this.nextToMove = player1Id;
        this.board = this.__generateBoard(boardWidth, boardHeight);
    }

    __generateBoard(width, height) {
        let board = [];
        for (let i = 0; i < width; i++) {
            const col = []
            for (let j = 0; j < height; j++)
                col.push(emptyToken);
            board.push(col);
        }
        return board;
    }

    // determines if someone as won the game
    // if so, sets this.winnerId to the winning playerId
    __determineWinner() {
        // check columns
        for (let colIdx in this.board) {
            const colCounts = { player1: 0, player2: 0 };
            for (let rowIdx in this.board[colIdx]) {
                if (this.board[colIdx][rowIdx] == player1Token)
                    colCounts.player1 += 1;
                if (this.board[colIdx][rowIdx] == player2Token)
                    colCounts.player2 += 1;
            }
            if (colCounts.player1 >= 4)
                this.__endGame(this.player1Id);
            if (colCounts.player2 >= 4)
                this.__endGame(this.player2Id);
        }

        // check rows
        for (let rowIdx = 0; rowIdx < boardHeight; rowIdx++) {
            const rowCounts = { player1: 0, player2: 0 };
            for (let colIdx = 0; colIdx < boardWidth; colIdx++) {
                if (this.board[colIdx][rowIdx] == player1Token)
                    rowCounts.player1 += 1;
                if (this.board[colIdx][rowIdx] == player2Token)
                    rowCounts.player2 += 1;
            }
            if (rowCounts.player1 >= 4)
                this.__endGame(this.player1Id);
            if (rowCounts.player2 >= 4)
                this.__endGame(this.player2Id);
        }

        // check ascending diagonals

        // check descending diagonals

        return null;
    }

    // getters / setters
    getState() {
        return this.state;
    }
    getGameId() {
        return this.gameId;
    }
    getPlayer1Id() {
        return this.player1Id;
    }
    getPlayer2Id() {
        return this.player2Id;
    }
    getWinnerId() {
        return this.winnerId;
    }
    getNextToMove() {
        return this.nextToMove;
    }
    getBoard() {
        return this.board;
    }
    setState(state) {
        this.state = state;
    }
    __endGame(winnerId) {
        this.nextToMove = null;
        this.winnerId = winnerId;
        this.setState(gameStates.FINISHED);
    }

    // returns null if: colNumber is invalid, game is not active, column is full, or it is not the provided playerId's turn
    // returns this game instance if the move was made successfully 
    makeMove(playerId, colNumber) {
        if (colNumber < 1 || boardWidth < colNumber || this.state != gameStates.ACTIVE )
            return null;
        const column = this.board[colNumber - 1];
        const openIdx = column.indexOf(emptyToken);
        if (openIdx == -1 || this.nextToMove != playerId) 
            return null;
        column[openIdx] = playerId == this.player1Id ? player1Token : player2Token;
        this.nextToMove = this.nextToMove == this.player1Id ? this.player2Id : this.player1Id;
        this.__determineWinner();
        return this;
    }

    // returns null if the game is not active
    // returns this game instance if the forfeit was processed successfully
    forfeit(playerId) {
        if (this.state != gameStates.ACTIVE) return null;
        const winnerId = this.player1Id == playerId ? this.player2Id : this.player1Id;
        this.__endGame(winnerId);
        return this;
    }
}

module.exports = { Game, boardWidth, gameStates };