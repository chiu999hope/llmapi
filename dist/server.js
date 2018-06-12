"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const mongo = require("connect-mongo");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
/**
 * Controllers (route handlers)
 */
const routeController = require("./controllers/route");
const controllers = {
    route: {
        index: routeController.index,
        get: routeController.get,
    }
};
const MongoStore = mongo(session);
/**
 * Load environment variables from .env file, where google maps API keys and external hosted mongoDB connection URI are configured.
 */
dotenv.config({ path: '.env.example' });
/**
 * Create Express server object instance.
 */
const app = express();
/**
 * Connect to MongoDB.
 */
mongoose.connect(process.env.MONGOLAB_URI || process.env.MONGODB_URI);
mongoose.connection.on('connected', () => {
    console.log('connected to MongoDB.');
});
mongoose.connection.on('error', () => {
    console.log('MongoDB connection error. Please make sure MongoDB is running.');
    process.exit();
});
/**
 * Express configuration
 */
app.set('port', process.env.PORT || 4000);
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: '0987654321',
    store: new MongoStore({
        url: process.env.MONGOLAB_URI || process.env.MONGODB_URI,
        autoReconnect: true
    })
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
/**
 * API app routes
 */
app.get('/:controller/:id', (req, res, next) => {
    console.log(`Received Get Request: ${req.params.controller}`);
    const controller = req.params.controller;
    if (controllers[controller]) {
        if (req.params.id) {
            controllers[controller].get(req, res, next);
        }
    }
    else {
        next('error');
    }
});
app.post('/:controller', (req, res, next) => {
    console.log(`Received Post Request: ${req.params.controller}`);
    const controller = req.params.controller;
    if (controllers[controller]) {
        controllers[controller].index(req, res, next);
    }
    else {
        next('error');
    }
});
/**
 * Error handler
 */
app.use(function (err, req, res, next) {
    console.error(err);
    res.status(500).send({
        error: err.toString()
    });
});
/**
 * Start Express server
 */
app.listen(app.get('port'), () => {
    console.log((' App is running at http://localhost:%d in %s mode'), app.get('port'), app.get('env'));
    console.log(' Press CTRL-C to stop\n');
});
module.exports = app;
//# sourceMappingURL=server.js.map