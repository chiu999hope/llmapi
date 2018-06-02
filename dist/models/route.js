"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const routeSchema = new mongoose.Schema({
    token: { type: String, unique: true },
    input: JSON,
    output: JSON,
    status: String,
    total_distance: Number,
    total_time: Number
}, { timestamps: true });
const routeModel = mongoose.model('route', routeSchema);
exports.default = routeModel;
//# sourceMappingURL=route.js.map