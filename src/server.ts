import * as express from 'express';
import { Request, Response, NextFunction } from 'express';
import * as session from 'express-session';

import * as bodyParser from 'body-parser';

import * as mongo from 'connect-mongo';
import * as mongoose from 'mongoose';

import * as dotenv from 'dotenv';

/**
 * Controllers (route handlers)
 */
import * as routeController from './controllers/route';
const controllers: any  = {
    route: {
        index: routeController.index,
        get: routeController.get,
    }
};

const MongoStore = mongo(session);
/**
 * Load environment variables from .env file, where google maps API keys and external hosted mongoDB connection URI are configured.
 */
dotenv.config({path: '.env.example' });

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
app.get('/:controller/:id', (req: Request, res: Response, next: NextFunction) => {
    console.log(`Received Get Request: ${req.params.controller}`);
    const controller = req.params.controller;
    if (controllers[controller]) {
        if (req.params.id) {
            (controllers[controller] as any).get(<any>req, <any>res, <any>next);
        }
    } else {
      next('error');
    }
  });
app.post('/:controller', (req: Request, res: Response, next: NextFunction) => {
    console.log(`Received Post Request: ${req.params.controller}`);
    const controller = req.params.controller;
    if (controllers[controller]) {
        controllers[controller].index(<any>req, <any>res, <any>next);
    } else {
      next('error');
    }
  });

/**
 * Error handler
 */
app.use(function(err: Error, req: Request, res: Response, next: NextFunction) {
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