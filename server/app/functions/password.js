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
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPassword = exports.createHash = void 0;
const crypto_1 = require("crypto");
function createHash(password) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const salt = (0, crypto_1.randomBytes)(128).toString("base64");
            (0, crypto_1.pbkdf2)(password, salt, 10000, 64, "sha512", (err, res) => {
                if (err)
                    reject(err);
                resolve({ hash: res.toString("base64"), salt });
            });
        });
    });
}
exports.createHash = createHash;
function checkPassword(password, userHash, salt) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, rejects) => {
            (0, crypto_1.pbkdf2)(password, salt, 10000, 64, "sha512", (err, hash) => {
                if (err)
                    rejects(err);
                resolve(userHash === hash.toString("base64"));
            });
        });
    });
}
exports.checkPassword = checkPassword;
