"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function Login(req, res) {
    const user = req.user;
    res.status(200).json({ userName: user === null || user === void 0 ? void 0 : user.user_name });
}
exports.default = Login;
