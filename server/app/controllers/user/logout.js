"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function logout(req, res) {
    req.logOut();
    res.status(200).json({ userName: "" });
}
exports.default = logout;
