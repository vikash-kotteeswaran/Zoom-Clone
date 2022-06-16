const path = require('path');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const {v4: uuidv4} = require('uuid');
const PORT = 3000;
app.set('view engine', 'ejs');
app.use(express.static("public"))

app.get('/', (req, res) => {
    res.status(200);
    res.redirect(`${uuidv4()}`)
})

app.get('/:room', (req, res) => {
    res.status(200);
    res.render('room', {roomId: req.params.room})
})

server.listen(PORT);