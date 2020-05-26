// import express = require('express');
// import * as express from 'express';
const express = require('express');
const routes = require('./router');

const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
    if('OPTIONS' === req.method) {
        res.sendStatus(200);
    } else {
        console.log(`${req.ip} ${req.method} ${req.url}`);
        next();
    }
});

app.use(express.json());
app.use('/', routes);

// app.get('/api', (req, res) => {
//     res.send({hello: 'world'});
// });

app.listen(3000, '127.0.0.1', function() {
    console.log("Server now listening on 3000");
});