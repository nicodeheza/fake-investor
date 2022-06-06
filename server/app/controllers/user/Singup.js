"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../../models/User"));
const Stock_1 = __importDefault(require("../../models/Stock"));
const password_1 = require("../../functions/password");
const passport_1 = __importDefault(require("passport"));
function Singup(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email, userName, password, repeat } = req.body;
            const emailRegEX = new RegExp(".+@.+");
            if (!emailRegEX.test(email)) {
                res.status(400).json({ message: "Please enter a valid email." });
                return;
            }
            const hashSalt = yield (0, password_1.createHash)(password);
            const saveUser = yield User_1.default.saveNewUser(userName, email, hashSalt.hash, hashSalt.salt);
            if (saveUser[0] === "success") {
                const fudId = yield Stock_1.default.getIdFromSymbol("FUD");
                yield User_1.default.addStockOwnership(saveUser[1], fudId, 1000000);
                passport_1.default.authenticate("local", (err, user, info) => {
                    if (err)
                        throw err;
                    if (!user)
                        res.json({ message: "No User Exists" });
                    else {
                        req.logIn(user, (err) => {
                            if (err)
                                throw err;
                            res.json({ userName: user.user_name });
                        });
                    }
                })(req, res);
            }
            else {
                if (saveUser.includes("Users.email")) {
                    res
                        .status(400)
                        .json({ message: "There is already an account associated with that email" });
                }
                else {
                    res.status(400).json({ message: "Error" });
                }
            }
        }
        catch (err) {
            console.log(err);
        }
    });
}
exports.default = Singup;
