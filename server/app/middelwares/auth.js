"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ userName: "" });
}
exports.default = checkAuthenticated;
