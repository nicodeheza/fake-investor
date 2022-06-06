"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function Auth(req, res) {
    if (req.isAuthenticated()) {
        const user = req.user;
        res.status(200).json({ userName: user[0].user_name });
    }
    else {
        res.status(200).json({ userName: "" });
    }
}
exports.default = Auth;
