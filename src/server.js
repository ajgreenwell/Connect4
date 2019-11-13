const express = require('express');
const mongoose = require('mongoose');
const db = require("../config/keys").mongoURI;
const games = require('./routes/api/games');

const app = express();
app.use(express.json());

// Connect to database
mongoose.connect(db, { useUnifiedTopology: true, useNewUrlParser: true })
        .then(() => console.log("MongoDB connected..."))
        .catch(err => console.log(err));

// Use routes
app.use('/api/games', games);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));