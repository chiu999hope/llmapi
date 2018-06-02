"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid = require("uuid");
const fetch = require("isomorphic-fetch");
const route_1 = require("../models/route");
/**
 * POST /route
 * Route API Handler.
 * @param req {Request} the Request
 * @param res {Response} the Response
 */
exports.index = (req, res, next) => {
    const inputParams = {
        uuid: uuid(),
        routeStart: [...JSON.parse(req.body.dropoffs)[0]],
        dropoffs: JSON.parse(req.body.dropoffs)
    };
    const wayPoints = inputParams.dropoffs.slice(1);
    // send token to client before calcuate the route
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ token: inputParams.uuid }));
    // Save request and token to MongoDB
    const _routeModel = new route_1.default({
        token: inputParams.uuid,
        status: 'PROCESSING',
        input: {
            dropoffs: wayPoints
        },
        output: {
            status: 'in progress'
        }
    });
    _routeModel.save(function (err) {
        if (err)
            return console.error(err);
    });
    getDirections(inputParams.routeStart, wayPoints)
        .then((data) => {
        data.sort(shortestDistance);
        route_1.default.update({
            token: {
                $eq: inputParams.uuid
            }
        }, {
            status: 'OK',
            output: {
                status: 'success',
                path: data[0].paths,
                total_distance: data[0].distance,
                total_time: data[0].duration,
            }
        }, function (err, raw) {
            if (err)
                return next('Failed to update MongoDB');
        });
    }).catch((error) => {
        // catch error and update respone json
        route_1.default.update({
            token: {
                $eq: inputParams.uuid
            }
        }, {
            status: 'ERROR',
            output: {
                status: 'failure',
                error: error
            }
        }, function (err, raw) {
            if (err)
                return next('Failed to update MongoDB');
        });
    });
};
/**
 * GET /route/<token>
 * Retrieve processed shortest path result from MongoDB.
 * @param req {Request} the Request
 * @param res {Response} the Response
 */
exports.get = (req, res, next) => {
    route_1.default.findOne({ token: req.params.id }, (err, route) => {
        if (!route)
            return next('route not found');
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(route.output));
    });
};
/**
 * Wrapper function for generating all possible routes to calculate travel distance and duration of each possible routes.
 * @param start {any} Start location's latitude and longitude
 * @param index {any} array of dropoff location's latitude and longitude
 */
function getDirections(start, waypoints) {
    const requests = [];
    const apiPromises = [];
    // loop through all possible routes and let google to optimize waypoints for us
    for (let j = 0; j < waypoints.length; j++) {
        const _waypoints = [];
        for (let i = 0; i < waypoints.length; i++) {
            if (i != j) {
                _waypoints.push(waypoints[i]);
            }
        }
        requests[j] = {};
        requests[j].destination = waypoints[j];
        requests[j].waypoints = _waypoints;
        requests[j].origin = start;
        apiPromises.push(sendDirectionsRequest(requests[j], j));
    }
    return Promise.all(apiPromises);
}
/**
 * Submit Google Direction API request for shortest path calculation.
 * @param request {any} possible route request parameters
 * @param index {any} index of possible route request
 */
function sendDirectionsRequest(request, index) {
    let wayPointsStr = '';
    for (const i in request.waypoints) {
        wayPointsStr += `|${request.waypoints[i]}`;
    }
    const params = {
        origin: request.origin.join(','),
        destination: request.destination.join(','),
        waypoints: 'optimize:true|' + wayPointsStr,
        travel_mode: 'driving',
        key: process.env.GOOGLEMAP_API_KEY
    };
    const url = new URL('https://maps.googleapis.com/maps/api/directions/json');
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    return fetch(url.toString()).then((response) => {
        if (!response.ok) {
            throw Error(response.statusText);
        }
        return response.json();
    }).then((data) => {
        const rtnData = {
            paths: [],
            distance: -1,
            duration: -1,
        };
        return new Promise(((reslove) => {
            rtnData.distance = 0;
            rtnData.duration = 0;
            // calculate end to end total distance and duration
            for (let i = 0; i < data.routes[0].legs.length; i++) {
                rtnData.distance += data.routes[0].legs[i].distance.value;
                rtnData.duration += data.routes[0].legs[i].duration.value;
            }
            // reconstruct geocoded waypoints
            const paths = [];
            rtnData.paths.push(request.origin);
            for (let i = 0; i < data.routes[0].waypoint_order.length; i++) {
                rtnData.paths.push(request.waypoints[data.routes[0].waypoint_order[i]]);
            }
            rtnData.paths.push(request.destination);
            reslove(rtnData);
        }));
    });
}
/**
 * Helper function to compare shortest distance
 * @param a {any} first route
 * @param b {any} second route
 */
function shortestDistance(a, b) {
    if (a.distance > b.distance)
        return 1;
    else if (a.distance < b.distance)
        return -1;
    else
        return 0;
}
//# sourceMappingURL=route.js.map